import { processQuery } from "./llm/executor.js";
import { oko } from "./llm/oko.js";
import { tools, handlers } from "./tools/index.js";
import * as readline from "readline";

const config = {
    model: oko.model,
    tools,
    handlers,
    instructions: oko.instructions
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

const main = async () => {
    console.log("🤖 Agent gotowy. Wpisz swoje zapytanie (lub 'exit' aby wyjść).\n");

    while (true) {
        const query = await ask("👤 Ty: ");

        if (query.trim().toLowerCase() === "exit") {
            console.log("👋 Do zobaczenia!");
            rl.close();
            break;
        }

        if (!query.trim()) continue;

        console.log("\n🔄 Agent pracuje...\n");
        await processQuery(query, config);

        console.log("\n");
        const continueAnswer = await ask("❓ Czy chcesz kontynuować? (tak/nie): ");

        if (continueAnswer.trim().toLowerCase() !== "tak") {
            console.log("👋 Do zobaczenia!");
            rl.close();
            break;
        }

        console.log("\n");
    }
};

main().catch(console.error);