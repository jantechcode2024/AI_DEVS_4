import { AI_DEVS_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY } from "../../../config.js";
import { decodeAttachment, saveAttachment } from "../util/encrypter.ts";
import OpenAI from "openai";
import path from "node:path";
import { readFile, writeFile, readdir } from "fs/promises";

const openRouter = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const openAI = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const API_URL = "https://hub.ag3nts.org/verify";
const TASK = "radiomonitoring";
const SANDBOX_ROOT = path.resolve(process.cwd(), "./workspace");

function assessSignalQuality(text: string): "noise" | "partial" | "clear" {
    // Tokeny zakłóceń — różnej długości, powtarzające się znaki
    const noisePattern = /\b(b+z+t*|k+s+h*|s+z+h*|s+h+|p+i+s+k+|t+r+z+a+s+k+|s+z+u+m+|k+h+)\b/gi;

    // Urwane zdania — kończą się na "..." w środku
    const truncatedPattern = /\.\.\./g;

    // Morse-like / TiTa patterns
    const morsePattern = /\b(Ti|Ta){2,}\b/g;

    const noiseMatches = (text.match(noisePattern) ?? []).length;
    const truncatedMatches = (text.match(truncatedPattern) ?? []).length;
    const morseMatches = (text.match(morsePattern) ?? []).length;

    const words = text.split(/\s+/).length;

    const noiseRatio = noiseMatches / words;
    const truncatedRatio = truncatedMatches / words;

    // Morse/Ti/Ta — zawsze szum
    if (morseMatches > 3) return "noise";

    // Dużo zakłóceń i urwanych zdań → szum
    if (noiseRatio > 0.15 && truncatedRatio > 0.15) return "noise";

    // Trochę zakłóceń ale są pełne zdania → partial
    if (noiseRatio > 0.05 || truncatedRatio > 0.1) return "partial";

    return "clear";
}

async function transcribeAudio(buffer: Buffer, extension: string): Promise<string> {
    const file = new File([buffer], `audio.${extension}`, { type: `audio/${extension}` });
    const transcription = await openAI.audio.transcriptions.create({
        file,
        model: "whisper-1",
        language: "pl",
    });
    return transcription.text;
}

async function extractTextFromImage(buffer: Buffer): Promise<string> {
    const base64 = buffer.toString("base64");
    const response = await openRouter.chat.completions.create({
        model: "openai/gpt-4o",
        messages: [{
            role: "user",
            content: [
                {
                    type: "image_url",
                    image_url: { url: `data:image/png;base64,${base64}` }
                },
                {
                    type: "text",
                    text: "Extract ALL text visible in this image. Return only the raw text, nothing else."
                }
            ]
        }],
        max_tokens: 500,
    });
    return response.choices[0].message.content ?? "";
}

async function callApi(body: object) {
    if (body.answer.action === "transmit") {
        console.log("📡 Transmitting data for verification...", body);
    }

    return await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

export const handlers = {

    async listen() {
        const body = { apikey: AI_DEVS_API_KEY, task: TASK, answer: { action: "listen" } };
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => null);
        const ts = Date.now();

        if (data.code === 201) {
            console.log("📻 Received message:", data.message);
            return "[STOP]";
        }

        // Binarny attachment
        if (!data.transcription) {
            const decoded = decodeAttachment(data);

            // Audio → Whisper → .txt
            console.log('DECODED IS!!!', decoded)
            if (decoded.mimeType.startsWith("audio/")) {
                const text = await transcribeAudio(decoded.buffer, decoded.extension);
                const txtFile = `signal_audio_${ts}.txt`;
                await writeFile(path.resolve(SANDBOX_ROOT, txtFile), text, "utf-8");
                console.log(`🎙️ Audio transcribed → ${txtFile}`);
                return `[SAVED:AUDIO_TRANSCRIPT] ${txtFile}`;
            }

            // Image → Vision → .txt
            if (decoded.mimeType.startsWith("image/")) {
                const text = await extractTextFromImage(decoded.buffer);
                const txtFile = `signal_image_${ts}.txt`;
                await writeFile(path.resolve(SANDBOX_ROOT, txtFile), text, "utf-8");
                console.log(`🖼️ Image OCR → ${txtFile}`);
                return `[SAVED:IMAGE_TRANSCRIPT] ${txtFile}`;
            }

            // CSV / JSON / text — zapisz i pozwól czytać
            const filePath = saveAttachment(decoded, "./workspace", `signal_${ts}`);
            console.log(`📎 Attachment saved → ${filePath}`);
            return `[ATTACHMENT:${decoded.extension.toUpperCase()}] Saved: ${filePath}. You may read this file.`;
        }

        const text: string = data.transcription;
        const quality = assessSignalQuality(text);

        if (quality === "noise") {
            console.log("📻 [NOISE] skipped");
            return `[NOISE] Pure interference, skipped.`;
        }

        if (quality === "partial") {
            const cleanFragments = text
                .split("...")
                .map(s => s.replace(/\b(bzzt|kssh|szzz|trzask|pisk|bzzz+|kshhh+)\b/gi, "").trim())
                .filter(s => s.length > 3)
                .join(" | ");

            const fileName = `signal_${ts}.txt`;
            await writeFile(path.resolve(SANDBOX_ROOT, fileName), cleanFragments, "utf-8");
            console.log(`📻 [PARTIAL] → ${fileName}`);
            return `[SAVED:PARTIAL] ${fileName}`;
        }

        // Czysty sygnał
        const fileName = `signal_${ts}.txt`;
        await writeFile(path.resolve(SANDBOX_ROOT, fileName), text, "utf-8");
        console.log(`📻 [CLEAR] → ${fileName}`);
        return `[SAVED:CLEAR] ${fileName}`;
    },

    async verify({ cityName, cityArea, warehousesCount, phoneNumber }: {
        cityName: string;
        cityArea: string;
        warehousesCount: string;
        phoneNumber: string;
    }) {
        const body = {
            apikey: AI_DEVS_API_KEY,
            task: TASK,
            answer: {
                action: "transmit",
                cityName,
                cityArea,
                warehousesCount,
                phoneNumber
            }
        };
        const res = await callApi(body);
        const data = await res.json().catch(() => null);
        console.log('verify response is ', data)
        return data;
    },

    async write_file({ relativePath, content }: { relativePath: string; content: string }) {
        console.log("✍️ Writing file:", relativePath);
        const fullPath = path.resolve(SANDBOX_ROOT, relativePath);
        await writeFile(fullPath, content, "utf-8");
        return { success: true, message: `File written: ${relativePath}` };
    },

    async read_file({ relativePath }: { relativePath: string }) {
        const fullPath = path.resolve(SANDBOX_ROOT, relativePath);
        const relativeToRoot = path.relative(SANDBOX_ROOT, fullPath);

        if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
            throw new Error("Access denied: path is outside sandbox");
        }

        const content = await readFile(fullPath, "utf-8");
        console.log("📖 Read file:", relativePath);
        return { content };
    },

    async list_files() {
        try {
            const files = await readdir(SANDBOX_ROOT);
            console.log("📁 Workspace files:", files);
            return { files };
        } catch {
            return { files: [] };
        }
    },
};