import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "c2talents_smtp_secure_encryption_key_2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plain text string (e.g. SMTP password) using AES-256-GCM
 */
export function encryptSecret(text: string): string {
  if (!text) return "";
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err: any) {
    console.error("[CRYPTO ERROR] Encryption failed:", err.message);
    return text;
  }
}

/**
 * Decrypt an AES-256-GCM encrypted string back to plain text
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return "";
  // Check if string format matches iv:authTag:encrypted
  const parts = cipherText.split(":");
  if (parts.length !== 3) {
    // String is unencrypted or plain text
    return cipherText;
  }

  try {
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err: any) {
    console.error("[CRYPTO ERROR] Decryption failed:", err.message);
    return cipherText;
  }
}
