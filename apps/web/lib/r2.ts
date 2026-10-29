/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare R2 Storage Wrapper
 */
export async function uploadToR2(
  bucket: R2Bucket | undefined,
  key: string,
  data: ArrayBuffer | Uint8Array,
  contentType = "image/jpeg"
): Promise<{ key: string; url: string }> {
  if (bucket) {
    await bucket.put(key, data, {
      httpMetadata: { contentType },
    });
    return {
      key,
      url: `/api/media/${encodeURIComponent(key)}`,
    };
  }

  // Fallback lokal / dev tanpa R2 binding
  // ponytail: in-memory / local stub for dev without cloudflare wrangler active
  return {
    key,
    url: `/api/media/${encodeURIComponent(key)}`,
  };
}

export async function getFromR2(
  bucket: R2Bucket | undefined,
  key: string
): Promise<{ data: ReadableStream | null; contentType: string } | null> {
  if (bucket) {
    const object = await bucket.get(key);
    if (!object) return null;
    return {
      data: object.body,
      contentType: object.httpMetadata?.contentType || "application/octet-stream",
    };
  }

  return null;
}
