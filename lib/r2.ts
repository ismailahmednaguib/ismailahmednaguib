// lib/r2.ts : عميل Cloudflare R2 للملفات الكبيرة — ملف مستقل
// يعمل فقط عندما توجد متغيرات R2 (اختياري، من Cloudflare Dashboard).
// الاستخدام: كتب PDF كبيرة + صور — 10GB مجانا + باندويث غير محدود.
// الإعداد من: Cloudflare Dashboard -> R2 -> Create bucket -> ثم
// R2 -> Manage R2 API tokens -> Create API token (Object Read & Write).
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
}

function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT as string,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
  });
}

function safeName(name: string): string {
  const base = (name || "file").split("/").pop() || "file";
  return `${Date.now()}-${base.replace(/[^\w.\-]+/g, "_").slice(0, 100)}`;
}

// يرفع الملف ويرجع رابطا عاما (لو R2_PUBLIC_URL مضبوط على دومين/باكت عام)
// وإلا يرجع المفتاح لتخزينه ثم توليد رابط موقع من لوحة Cloudflare
export async function uploadToR2(
  buf: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const client = r2Client();
  const bucket = process.env.R2_BUCKET as string;
  const key = `ian/${safeName(filename)}`;
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: buf, ContentType: contentType })
  );
  const pub = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  if (pub) return { url: `${pub}/${key}`, key };
  return { url: "", key };
}

export function filesMode(): "r2" | "supabase" | "none" {
  if (isR2Configured()) return "r2";
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  return "none";
}
