import { processQuery } from "./src/executor.js"
import { navigator } from "./src/navigator.js";
import { tools, handlers } from "./tools/index.js"
import { AI_DEVS_API_KEY } from "../../config.js"

const navigatorConfig = {
    model: navigator.model,
    tools,
    handlers,
    instructions: navigator.instructions
};



const queries = [
    // List files
    "Please find information about all provided vehicles and analyze each of them. Summarize vehicles in easy to read table format VEHICLE| FOOD PER MOVE | FUEL PER MOVE | OVERCOME_OBSTACLES | insurmountable_obstacles , add this info to summarize.txt as relative path (update or create file). Focus on obstacles, fuel and food consumption.  Add very simple info like OVERCOME_OBSTACLES: water - dont add extra desctiption",

    //   // Create a file
    "Find map of Skolwin terrain in json format represents 10 x 10 board. Save and summarize this map into existing file summarize.txt. Do not clear this file, update it. In summary save all info about obstacles, type and coordinates.",

    //   // Read a file
    `
    Read summarize.txt file and plan the route to goal. Don't use external calls anymore.
    It should be the shortest possible way and the lowest in consuming food and fuel. 
    Food and Fuel never can reach zero. Each move like 'up' uses particular amount of food and fuel defined in vehicle. 
    Before you send verify request check: 
    - if planned route wont consume all food (> 10 units) or all fuel (> 10 units),
    - use combined way of transport - check each vehicle obstacles that they can overcome and cant, based on that plan the combined route. So f.e. bike cant go to water but its faster to get close to the water and then walk can be contine.
    - if vehicle meet obstacle you can leave it and continue with walk (dismount move)
    - if you reach the goal 
    Note: if in the response you will get info that transport vehicle sank or crashed on step 10 that means you should leave vehicle on this step. 
    Then send it to verification. If you wont get {FLG:...} as a response, read response and based on that retry with new route. So f.e is response will be that something crashed on rock you should change route, if something cant go to water avoid it.
    `

   

];

const main = async () => {
    let finalRes = "";

    for (const query of queries) {
        const res = await processQuery(query, navigatorConfig);
        finalRes = res;
        console.log("Cur res is ", res)
    }
    console.log('---FINAL_RES---')
    console.log(finalRes)
};

main().catch(console.error);