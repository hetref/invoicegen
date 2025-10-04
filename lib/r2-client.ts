import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
  throw new Error("Cloudflare R2 credentials are not configured");
}

// Initialize R2 client
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

if (!BUCKET_NAME) {
  throw new Error("CLOUDFLARE_R2_BUCKET_NAME is not configured");
}

/**
 * Generate a presigned URL for uploading a file to R2
 * @param key - The S3 key (path) where the file will be stored
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading a file from R2
 * @param key - The S3 key (path) of the file to download
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getDownloadPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Delete a file from R2
 * @param key - The S3 key (path) of the file to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * List all objects in a specific prefix (folder)
 * @param prefix - The folder prefix (e.g., "userId/")
 */
export async function listObjectsInR2(prefix: string) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await r2Client.send(command);
  return response.Contents || [];
}

