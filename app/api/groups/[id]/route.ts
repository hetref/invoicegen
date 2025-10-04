import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2-client";

// PATCH - Update group (rename or move)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, parentId } = body;

    // Find the group
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verify ownership
    if (group.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If moving to a parent, verify it exists and prevent circular references
    if (parentId !== undefined && parentId !== null) {
      const parentGroup = await prisma.group.findUnique({
        where: { id: parentId },
      });

      if (!parentGroup || parentGroup.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Parent group not found" },
          { status: 404 }
        );
      }

      // Prevent making a group its own parent or descendant
      if (parentId === id) {
        return NextResponse.json(
          { error: "A group cannot be its own parent" },
          { status: 400 }
        );
      }

      // Check if parentId is a descendant of this group (prevent circular reference)
      const isDescendant = await checkIsDescendant(id, parentId);
      if (isDescendant) {
        return NextResponse.json(
          { error: "Cannot move group to its own descendant" },
          { status: 400 }
        );
      }
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
      include: {
        _count: {
          select: {
            invoices: true,
            children: true,
          },
        },
      },
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

// DELETE - Delete group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action"); // 'delete' or 'move'
    const targetGroupId = searchParams.get("targetGroupId"); // where to move invoices

    // Find the group
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        invoices: true,
        children: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verify ownership
    if (group.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle invoices based on action
    if (action === "delete") {
      // Delete all invoices in this group and subgroups from R2 and database
      // Note: We manually delete invoices because the schema has onDelete: SetNull
      // which would move invoices to root instead of deleting them
      const allInvoices = await getAllInvoicesInGroupAndSubgroups(id);
      
      // Delete from R2 storage
      for (const invoice of allInvoices) {
        try {
          await deleteFromR2(invoice.r2Key);
        } catch (error) {
          console.error(`Failed to delete invoice ${invoice.id} from R2:`, error);
          // Continue with other deletions even if one fails
        }
      }

      // Delete all invoices from database
      const invoiceIds = allInvoices.map(inv => inv.id);
      if (invoiceIds.length > 0) {
        await prisma.invoice.deleteMany({
          where: {
            id: { in: invoiceIds }
          }
        });
      }

      // Delete the group (cascade will delete child groups)
      await prisma.group.delete({
        where: { id },
      });
    } else if (action === "move") {
      // Move invoices to target group (or root if null)
      if (targetGroupId && targetGroupId !== "root") {
        const targetGroup = await prisma.group.findUnique({
          where: { id: targetGroupId },
        });

        if (!targetGroup || targetGroup.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Target group not found" },
            { status: 404 }
          );
        }
      }

      // Move all invoices to the target group
      await prisma.invoice.updateMany({
        where: { groupId: id },
        data: { groupId: targetGroupId === "root" ? null : targetGroupId },
      });

      // Move child groups to the target group
      await prisma.group.updateMany({
        where: { parentId: id },
        data: { parentId: targetGroupId === "root" ? null : targetGroupId },
      });

      // Delete the now-empty group
      await prisma.group.delete({
        where: { id },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'delete' or 'move'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}

// Helper function to check if a group is a descendant of another
async function checkIsDescendant(
  ancestorId: string,
  descendantId: string
): Promise<boolean> {
  let currentId: string | null = descendantId;

  while (currentId) {
    if (currentId === ancestorId) {
      return true;
    }

    const group: { parentId: string | null } | null = await prisma.group.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    currentId = group?.parentId || null;
  }

  return false;
}

// Helper function to get all invoices in a group and its subgroups
async function getAllInvoicesInGroupAndSubgroups(groupId: string) {
  const invoices: any[] = [];
  
  async function collectInvoices(gId: string) {
    const group = await prisma.group.findUnique({
      where: { id: gId },
      include: {
        invoices: true,
        children: true,
      },
    });

    if (group) {
      invoices.push(...group.invoices);
      for (const child of group.children) {
        await collectInvoices(child.id);
      }
    }
  }

  await collectInvoices(groupId);
  return invoices;
}

