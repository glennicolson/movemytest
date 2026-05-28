import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${HASH_PREFIX}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string | null) {
  if (!passwordHash) return false;

  const [prefix, salt, storedHex] = passwordHash.split("$");
  if (prefix !== HASH_PREFIX || !salt || !storedHex) return false;

  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const stored = Buffer.from(storedHex, "hex");

  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}
