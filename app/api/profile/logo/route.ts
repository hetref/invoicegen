import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { uploadBufferToR2, getObjectFromR2, deleteFromR2 } from "@/lib/r2-client";
import { Readable } from "stream";

const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

// GET - Serve the user's uploaded logo directly from S3 (or external URL)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (!user || !user.image) {
      return NextResponse.json({ error: "No logo found" }, { status: 404 });
    }

    // If the image is an external URL (e.g. Google OAuth avatar), redirect or fetch
    if (user.image.startsWith("http://") || user.image.startsWith("https://")) {
      return NextResponse.redirect(user.image);
    }

    // Otherwise, user.image is an S3/R2 key
    try {
      const s3Response = await getObjectFromR2(user.image);
      const contentType = s3Response.ContentType || "image/png";

      if (!s3Response.Body) {
        return NextResponse.json({ error: "Logo file not found in storage" }, { status: 404 });
      }

      // Handle stream for Next.js Response
      const bodyStream = s3Response.Body as any;
      if (bodyStream instanceof Readable) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of bodyStream) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        }
        const buffer = Buffer.concat(chunks);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }

      return new NextResponse(bodyStream as any, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    } catch (s3Error) {
      console.error("Error retrieving logo from S3:", s3Error);
      return NextResponse.json({ error: "Failed to retrieve logo from storage" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in GET /api/profile/logo:", error);
    return NextResponse.json({ error: "Failed to fetch logo" }, { status: 500 });
  }
}

// POST - Upload a brand/company logo to S3 and update profile
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PNG, JPEG, SVG, or WebP image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_LOGO_SIZE) {
      return NextResponse.json(
        { error: "Logo file size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = "png";
    if (file.type === "image/jpeg" || file.type === "image/jpg") ext = "jpg";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/svg+xml") ext = "svg";
    else if (file.type === "image/gif") ext = "gif";

    // Fetch existing user record to check for old logo cleanup
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    const oldKey = user?.image;
    const newKey = `${session.user.id}/brand/logo-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    await uploadBufferToR2(newKey, buffer, file.type);

    // Clean up old S3 logo if it was an internal S3 key
    if (oldKey && !oldKey.startsWith("http://") && !oldKey.startsWith("https://") && oldKey !== newKey) {
      try {
        await deleteFromR2(oldKey);
      } catch (delError) {
        console.warn("Could not delete previous logo from S3:", delError);
      }
    }

    // Update user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: newKey },
    });

    return NextResponse.json({
      success: true,
      logoUrl: `/api/profile/logo?v=${Date.now()}`,
      key: newKey,
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
  }
}

// DELETE - Remove company logo from S3 and database
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (user?.image && !user.image.startsWith("http://") && !user.image.startsWith("https://")) {
      try {
        await deleteFromR2(user.image);
      } catch (delError) {
        console.warn("Could not delete logo from S3:", delError);
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json({ error: "Failed to remove logo" }, { status: 500 });
  }
}
