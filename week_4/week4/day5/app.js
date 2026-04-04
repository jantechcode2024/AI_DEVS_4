import { processQuery } from "./src/executor.js"
import { orders } from "./src/orders.js";
import { tools, handlers } from "./tools/index.js"

const ordersConfig = {
    model: orders.model,
    tools,
    handlers,
    instructions: orders.instructions
};


const query = `
Please create orders based on the demand and supply of goods in different cities. Demand of cities you will find in food4cities.json file in workspace.
`;

const main = async () => {
    
    const res = await processQuery(query, ordersConfig);
    console.log('---FINAL_RES---')
    console.log(res)
};

main().catch(console.error);