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

  const input = "https://hub.ag3nts.org/dane/doc/index.md";
  await processQuery(input, config);
  
};

main().catch(console.error);