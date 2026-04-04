import { processQuery } from "./src/executor.js"
import { api } from "./src/config.js";
import { tools, handlers } from "./tools/index.js"

const config = {
    model: api.model,
    tools,
    handlers,
    instructions: api.instructions
};


// ...existing code...
const query = `Configure wind turbine based on weather.`;
const main = async () => {

    const res = await processQuery(query, config);
    console.log('---FINAL_RES---');
    console.log(res)
};

main().catch(console.error);