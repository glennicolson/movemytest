import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const privateStorageRoot = join(process.cwd(), "var", "documents");
const privateStoragePrefix = "private:learner-documents/";
const legacyPublicPrefix = "/uploads/learner-documents/";

export function sanitizeDocumentFileName(value: string) {
  const safeBase = basename(value).replace(/[^a-zA-Z0-9._-]/g, "-");
  return safeBase || "document";
}

export function buildDocumentAccessPath(documentId: string) {
  return `/documents/${documentId}`;
}

export async function persistLearnerDocumentFile(learnerId: string, file: File) {
  const originalName = sanitizeDocumentFileName(file.name || "document");
  const extension = extname(originalName);
  const stem = originalName.slice(0, originalName.length - extension.length) || "document";
  const storedName = `${Date.now()}-${stem}${extension}`;
  const relativeStoragePath = `${learnerId}/${storedName}`;
  const absoluteDir = join(privateStorageRoot, learnerId);
  const absolutePath = join(absoluteDir, storedName);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return {
    fileName: originalName,
    storagePath: `${privateStoragePrefix}${relativeStoragePath}`,
    mimeType: file.type || null,
  };
}

function resolveAbsoluteDocumentPath(storagePath: string) {
  if (storagePath.startsWith(privateStoragePrefix)) {
    return join(privateStorageRoot, storagePath.slice(privateStoragePrefix.length));
  }

  if (storagePath.startsWith(legacyPublicPrefix)) {
    return join(process.cwd(), "public", storagePath);
  }

  return null;
}

export async function readStoredDocument(storagePath: string) {
  const absolutePath = resolveAbsoluteDocumentPath(storagePath);
  if (!absolutePath) return null;

  try {
    const buffer = await readFile(absolutePath);
    return { buffer, absolutePath };
  } catch {
    return null;
  }
}

export async function deleteStoredDocument(storagePath: string) {
  const absolutePath = resolveAbsoluteDocumentPath(storagePath);
  if (!absolutePath) return;
  await unlink(absolutePath).catch(() => undefined);
}
