import { processQuery } from "./src/executor.js"
import { commandExecutor } from "./src/commandExecutor.js";
import { tools, handlers } from "./tools/index.js"

const config = {
    model: commandExecutor.model,
    tools,
    handlers,
    instructions: commandExecutor.instructions
};


const query = `
We have access to a server that stores time-stamped logs. They are located in the /data directory. Your goal is to determine on which day, in which city, and at which coordinates we need to be in order to meet Rafał.
You must find the date when Rafał was found and arrive at that location one day earlier. The server you are connecting to has access to standard Linux tools.
NOTE! Remember that you must return the date ONE DAY BEFORE Rafał's body was found.
`;

const main = async () => {

    const res = await processQuery(query, config);
    console.log('---FINAL_RES---')
    console.log(res)
};

main().catch(console.error);