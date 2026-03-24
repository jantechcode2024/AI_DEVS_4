import { chat, extractText } from "./api.js";

const BATCH_SIZE = 1000;

function normalizeUserInput(input) {
    const query = input.query ?? "";
    const toAnalyze = Array.isArray(input.toAnalyze) ? input.toAnalyze : [];

    return {
        role: "user",
        content: [
            {
                type: "input_text",
                text: `
QUERY:
${query}

TO_ANALYZE:
${JSON.stringify(toAnalyze, null, 2)}

Zwróć WYŁĄCZNIE poprawny JSON.
Format odpowiedzi:
["1743", "5000"]

Zasady:
- zwróć tylko wartości fileName pasujące do QUERY
- bez dodatkowego tekstu
- bez opisu
- bez markdowna
- bez \`\`\`
- jeśli nic nie pasuje, zwróć []
                `.trim(),
            },
        ],
    };
}

function parseModelArray(text) {
    if (!text) return [];

    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return [];

    try {
        const parsed = JSON.parse(match[0]);

        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((item) => {
                if (typeof item === "string") return item;
                if (item && typeof item === "object" && item.fileName) return item.fileName;
                return null;
            })
            .filter(Boolean);
    } catch (err) {
        console.error("Błąd parsowania JSON:", cleaned);
        return [];
    }
}

const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

export const processQuery = async (input, { model, instructions }) => {
    const chatConfig = { model, instructions };

    const prompt = input.query;
    const items = input.toAnalyze ?? [];
    const total = items.length;

    if (!total) {
        console.log("Brak danych do analizy");
        return [];
    }

    const batches = chunkArray(items, BATCH_SIZE);
    const matchedFileNames = [];

    console.log(`Start analizy. Łącznie rekordów: ${total}, batch size: ${BATCH_SIZE}`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const analyzedCount = Math.min((batchIndex + 1) * BATCH_SIZE, total);

        console.log(`\n--- BATCH ${batchIndex + 1}/${batches.length} ---`);
        console.log(`Analizuję ${analyzedCount}/${total}`);

        const conversation = [
            normalizeUserInput({
                query: prompt,
                toAnalyze: batch,
            }),
        ];

        const response = await chat({
            ...chatConfig,
            input: conversation,
        });

        const text = extractText(response)?.trim() ?? "[]";
        console.log("RAW RESPONSE:", text);

        const batchFileNames = parseModelArray(text);
        console.log("MATCHED:", batchFileNames);

        matchedFileNames.push(...batchFileNames);
    }

    console.log("\nAnaliza zakończona");
    return matchedFileNames;
};