import fs from "node:fs/promises";
import path from "node:path";

const SESSIONS_DIR = path.resolve(process.cwd(), "sessions");

async function ensureDir() {
    await fs.mkdir(SESSIONS_DIR, {recursive: true})
}

function safeId(sessionId) {
  return String(sessionId).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function sessionFile(sessionId) {
  return path.join(SESSIONS_DIR, `${safeId(sessionId)}.json`);
}

export async function loadSessionMessages(sessionId) {
  await ensureDir();

  try {
    const raw = await fs.readFile(sessionFile(sessionId), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // brak pliku = nowa sesja
    if (e?.code === "ENOENT") return [];
    throw e;
  }
}

export async function saveSessionMessages(sessionId, messages) {
  await ensureDir();
  await fs.writeFile(sessionFile(sessionId), JSON.stringify(messages, null, 2), "utf8");
}