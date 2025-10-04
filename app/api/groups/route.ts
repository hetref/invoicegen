import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// GET - List all groups for the authenticated user (tree structure)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: { userId: session.user.id },
      include: {
        children: true,
        _count: {
          select: {
            invoices: true,
            children: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, parentId } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    // If parentId is provided, verify it exists and belongs to the user
    if (parentId) {
      const parentGroup = await prisma.group.findUnique({
        where: { id: parentId },
      });

      if (!parentGroup || parentGroup.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Parent group not found" },
          { status: 404 }
        );
      }
    }

    const group = await prisma.group.create({
      data: {
        id: uuidv4(),
        name: name.trim(),
        userId: session.user.id,
        parentId: parentId || null,
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

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}

