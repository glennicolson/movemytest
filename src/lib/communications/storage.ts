import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const privateStorageRoot = join(process.cwd(), "var", "crm-attachments");
const privateStoragePrefix = "private:crm-attachments/";

function sanitizeAttachmentFileName(value: string) {
  const safeBase = basename(value).replace(/[^a-zA-Z0-9._-]/g, "-");
  return safeBase || "attachment";
}

function resolveAbsoluteAttachmentPath(storagePath: string) {
  if (!storagePath.startsWith(privateStoragePrefix)) {
    return null;
  }

  return join(privateStorageRoot, storagePath.slice(privateStoragePrefix.length));
}

export async function persistCrmAttachmentFile(messageId: string, fileName: string, content: Buffer) {
  const originalName = sanitizeAttachmentFileName(fileName || "attachment");
  const extension = extname(originalName);
  const stem = originalName.slice(0, originalName.length - extension.length) || "attachment";
  const storedName = `${Date.now()}-${stem}${extension}`;
  const relativeStoragePath = `${messageId}/${storedName}`;
  const absoluteDir = join(privateStorageRoot, messageId);
  const absolutePath = join(absoluteDir, storedName);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, content);

  return {
    fileName: originalName,
    storagePath: `${privateStoragePrefix}${relativeStoragePath}`,
  };
}

export async function readStoredCrmAttachment(storagePath: string) {
  const absolutePath = resolveAbsoluteAttachmentPath(storagePath);
  if (!absolutePath) return null;

  try {
    const buffer = await readFile(absolutePath);
    return { buffer, absolutePath };
  } catch {
    return null;
  }
}

export async function deleteStoredCrmAttachment(storagePath: string) {
  const absolutePath = resolveAbsoluteAttachmentPath(storagePath);
  if (!absolutePath) return;
  await unlink(absolutePath).catch(() => undefined);
}
