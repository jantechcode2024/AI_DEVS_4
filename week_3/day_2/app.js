import { processQuery } from "./src/executor.js"
import { system } from "./src/system.js";
import { tools, handlers } from "./tools/index.js";

const config = {
    model: system.model,
    tools,
    handlers,
    instructions: system.instructions
};

const main = async () => {
    const script = '/opt/firmware/cooler/cooler.bin';
    const query = `Run script via virtual machine API. Script path: ${script}. 
    This script could be secure by password, you should find it using only allowed API commands in virtual machine and according to rules. 
    If something will went wrong u can open file settings.ini and reconfigure it to make it work. 
    If the system will be too much destroyed by your commands you can use reboot action to restart it and try again from scratch.`;
    await processQuery(query, config);
};

main().catch(console.error);