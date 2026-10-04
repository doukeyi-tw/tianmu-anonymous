import { put, del } from '@vercel/blob';
import crypto from 'node:crypto';

const allowed = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/gif', 'gif']]);
export const maxImageBytes = Number(process.env.MAX_IMAGE_BYTES || 3670016);

function matchesSignature(type, bytes) {
  if (type === 'image/jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (type === 'image/gif') return ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'));
  if (type === 'image/webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

export function validateImage(file) {
  if (!file) return null;
  if (!allowed.has(file.mimeType)) throw new Error('INVALID_IMAGE_TYPE');
  if (!file.data?.length || file.data.length > maxImageBytes) throw new Error('LIMIT_FILE_SIZE');
  if (!matchesSignature(file.mimeType, file.data)) throw new Error('INVALID_IMAGE_CONTENT');
  return { contentType: file.mimeType, extension: allowed.get(file.mimeType) };
}

export async function uploadImage(file) {
  const metadata = validateImage(file);
  if (!metadata) return null;
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_UNAVAILABLE');
  const pathname = `posts/${Date.now()}-${crypto.randomUUID()}.${metadata.extension}`;
  const blob = await put(pathname, file.data, { access: 'public', contentType: metadata.contentType, addRandomSuffix: false });
  return { url: blob.url, pathname, contentType: metadata.contentType };
}

export async function removeImage(pathname) {
  if (pathname && process.env.BLOB_READ_WRITE_TOKEN) await del(pathname);
}
