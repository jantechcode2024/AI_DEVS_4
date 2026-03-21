import { processQuery } from "./src/executor.js";
import { mailer } from "./src/mailer.js";
import { tools, handlers } from "./tools/index.js";
import * as readline from "readline/promises";


const config = {
    model: mailer.model,
    tools,
    handlers,
    instructions: mailer.instructions
};

const main = async () => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question(`Welcome to mailbox analyzing system, how can I help you? `)).trim().toLowerCase();
    
    await processQuery(answer, config);
};

main().catch(console.error);