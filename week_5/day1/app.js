import { processQuery } from "./src/executor.js"
import { analyzer } from "./src/analyzer.ts";
import { tools, handlers } from "./tools/index.ts"
import { AI_DEVS_API_KEY } from "../../config.js"

const analyzerConfig = {
    model: analyzer.model,
    tools,
    handlers,
    instructions: analyzer.instructions
};


const query = `Proszę znajdź mi wszystkie informację na temat miasta, o którym w radiu mówią "Syjon". Chciałbym poznać:
- Dokładną nazwę miasta 
- Powierzchnie tego miasta z dokładnością do dwóch miejsc po przecinku 
- Ilość magazynów w mieście 
- Numer telefou do osoby kontaktowej z miastem "Syjon"
`;

const main = async () => {
    const start = {
        apikey: AI_DEVS_API_KEY,
        task: "radiomonitoring",
        answer: {
            action: "start"
        }
    }

    //start 
    console.log('Starting catching signal...')
    await fetch("https://hub.ag3nts.org/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(start),
    });

    console.log('Signal caught! Starting processing query...')

    const res = await processQuery(query, analyzerConfig);
    console.log('---FINAL_RES---')
    console.log(res)
};

main().catch(console.error);