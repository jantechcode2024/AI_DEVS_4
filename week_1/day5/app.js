import { processQuery } from "./src/executor.js";
import { api } from "./src/config.js";
import { tools, handlers } from "./tools/index.js";

const config = {
    model: api.model,
    tools,
    handlers,
    instructions: api.instructions
};

const main = async () => {
    const query = "Activate X-01 route based on API documentation. Return activation flag in format {FLG:...} as final answer.";
    await processQuery(query, config);
};

main().catch(console.error);