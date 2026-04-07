import { AI_DEVS_API_KEY, OPENAI_API_KEY } from "../../../config.js";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { ElevenLabsClient } from "elevenlabs";



const elevenLabs = new ElevenLabsClient({
    apiKey: "sk_b23d8c4b1844ddc6d1356a0d25dba3cf17a6d75b7fbd203e"
});

const openAI = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const API_URL = "https://hub.ag3nts.org/verify";
const TASK = "phonecall";

let messageCounter = 0;


const WORKSPACE_DIR = path.join(process.cwd(), "workspace");
if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}


function humanizeText(text: string): string {
    return text
        // RD472 → "er de czterysta siedemdziesiąt dwa"
        .replace(/\bRD(\d+)\b/g, (_, num) => `er de ${numberToWords(parseInt(num))}`)
        // S7, A1, DK8 itp → "es siedem", "a jeden", "de ka osiem"
        .replace(/\b([A-Z]{1,2})(\d+)\b/g, (_, letters, num) => {
            const spelled = letters.split('').map(spellLetter).join(' ');
            return `${spelled} ${numberToWords(parseInt(num))}`;
        });
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

function spellLetter(l: string): string {
    const map: Record<string, string> = {
        A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'ef',
        G: 'gie', H: 'ha', I: 'i', J: 'jot', K: 'ka', L: 'el',
        M: 'em', N: 'en', O: 'o', P: 'pe', R: 'er', S: 'es',
        T: 'te', U: 'u', W: 'wu', Z: 'zet'
    };
    return map[l] ?? l.toLowerCase();
}

function numberToWords(n: number): string {
    const ones = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
    const teens = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
    const tens = ['', 'dziesięć', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
    const hundreds = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];

    if (n === 0) return 'zero';
    if (n >= 1000) return `${numberToWords(Math.floor(n / 1000))} tysiące ${numberToWords(n % 1000)}`.trim();

    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    let result = '';
    if (h > 0) result += hundreds[h] + ' ';
    if (t === 1) result += teens[o];
    else {
        if (t > 0) result += tens[t] + ' ';
        if (o > 0) result += ones[o];
    }

    return result.trim();
}

export const handlers = {

    async talk({ message }: { message: string }) {
      
        const humanized = humanizeText(message);

        // Text → TTS → mp3 buffer
        const audioStream = await elevenLabs.generate({
            voice: "JBFqnCBsd6RMkjVDRZzb",        // męski głos
            text: humanized,
            model_id: "eleven_multilingual_v2",  // obsługuje polski
        });

        const chunks: Buffer[] = [];
        for await (const chunk of audioStream) {
            chunks.push(Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);


        messageCounter++;
        const outFile = path.join(WORKSPACE_DIR, `message_${messageCounter}_out.mp3`);
        fs.writeFileSync(outFile, buffer);

        // mp3 buffer → base64
        const base64Audio = buffer.toString("base64");

        console.log("📡 Sending audio to API...");
        const body = { apikey: AI_DEVS_API_KEY, task: TASK, answer: { audio: base64Audio } };
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);
        console.log("📡 API response:", data);
        // Jeśli odpowiedź zawiera audio w base64 → transkrybuj przez Whisper
        if (data?.message) {
            const responseBuffer = Buffer.from(data.audio, "base64");
            const transcription = await transcribeAudio(responseBuffer, "mp3");
            console.log("📝 Transcribed response:", transcription);
            return transcription;
        }

        return "No response message";
    }
};