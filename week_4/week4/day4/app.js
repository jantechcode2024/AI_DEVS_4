import { processQuery } from "./src/executor.js"
import { filesystem } from "./src/filesystem.js";
import { tools, handlers } from "./tools/index.js"

const filesystemConfig = {
    model: filesystem.model,
    tools,
    handlers,
    instructions: filesystem.instructions
};


const query = `Please create for me external file system file with directories.
After action "done" you will get response with {FLG:...} if file system is created correctly, 
if not, analyze response and try to fix it based on response from API.`;

const main = async () => {
    
    const res = await processQuery(query, filesystemConfig);
    console.log('---FINAL_RES---')
    console.log(res)
};

main().catch(console.error);