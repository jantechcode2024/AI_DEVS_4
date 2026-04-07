import fs from "fs";
import path from "path";

export interface ApiResponse {
  code: number;
  message: string;
  meta: string;
  attachment: string;
  filesize: number;
}

export interface DecryptedAttachment {
  mimeType: string;
  extension: string;
  buffer: Buffer;
  text?: string;
  json?: unknown;
}

export function decodeAttachment(response: ApiResponse): DecryptedAttachment {
  const buffer = Buffer.from(response.attachment, "base64");
  const mimeType = response.meta;
  const extension = getExtension(mimeType);

  const result: DecryptedAttachment = {
    mimeType,
    extension,
    buffer,
  };

  if (isTextBased(mimeType)) {
    result.text = buffer.toString("utf-8");
  }

  if (mimeType === "application/json") {
    try {
      result.json = JSON.parse(buffer.toString("utf-8"));
    } catch {
      console.warn("Failed to parse JSON attachment");
    }
  }

  return result;
}

/**
 * Saves the decoded attachment to disk.
 * @param attachment - result of decodeAttachment()
 * @param outputDir  - folder where the file will be saved (default: "./output")
 * @param fileName   - optional base name, e.g. "signal" → "signal.png"
 * @returns full path to the saved file
 */
export function saveAttachment(
  attachment: DecryptedAttachment,
  outputDir: string = "./output",
  fileName?: string
): string {
  fs.mkdirSync(outputDir, { recursive: true });

  const baseName = fileName ?? `attachment_${Date.now()}`;
  const fullPath = path.join(outputDir, `${baseName}.${attachment.extension}`);

  fs.writeFileSync(fullPath, attachment.buffer);
  console.log(`✅ Saved: ${fullPath} (${attachment.mimeType})`);

  return fullPath;
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/json": "json",
    "application/pdf": "pdf",
  };
  return map[mimeType] ?? "bin";
}

function isTextBased(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json"
  );
}