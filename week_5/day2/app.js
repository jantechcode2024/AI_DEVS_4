import { processQuery } from "./src/executor.js"
import { bot } from "./src/analyzer.ts";
import { tools, handlers } from "./tools/index.ts"
import { AI_DEVS_API_KEY } from "../../config.js"

const botConfig = {
    model: bot.model,
    tools,
    handlers,
    instructions: bot.instructions
};


const query = `Porozmawiaj z operatorem, odpowiadaj na jego odpowiedzi logicznie i naturalnie. Zadaj operatorowi nasteptujace pytania w ciagu rozmowy:
1. Przedstaw sie jako Tymon Gajewski - wiadomość 1, tylko Cześć nazywam sie Tymon Gajewski.
2. Zapytaj operatora o status dróg RD224, RD472 i RD820, Musisz poinformować także operatora, że pytasz o to ze względu na transport organizowany do jednej z baz Zygfryda - podaj to wszystko w jednej wiadomości.
3. Jeśli operator wspomni o tym, która droga jest przejezdna poproś go, aby wylaczyl monitoring na tej drodze.
4. Zakończ rozmowe, podziękuj operatorowi za pomoc i pożegnaj się.

`;

const main = async () => {
    const start = {
        apikey: AI_DEVS_API_KEY,
        task: "phonecall",
        answer: {
            action: "start"
        }
    }

    //start 
    console.log('Starting call..')
    await fetch("https://hub.ag3nts.org/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(start),
    });

    const res = await processQuery(query, botConfig);
    console.log('---FINAL_RES---')
    console.log(res)
};

main().catch(console.error);