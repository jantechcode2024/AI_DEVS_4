import { processQuery } from "./src/executor.js"
import { navigator } from "./src/navigator.js";
import { tools, handlers } from "./tools/index.js"

const navigatorConfig = {
    model: navigator.model,
    tools,
    handlers,
    instructions: navigator.instructions
};


const query = `Please find partisan on the map. We know that he is somewhere in the highest building in the city (propably B3)`;

const main = async () => {
    
    const res = await processQuery(query, navigatorConfig);
    console.log('---FINAL_RES---')
    console.log(res)
};

main().catch(console.error);