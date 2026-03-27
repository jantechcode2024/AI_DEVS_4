import { AI_DEVS_API_KEY } from "../../config.js"
import { nextMove } from "./moveResolver.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ROBOT_ACTIONS = ['left', 'right', 'wait', 'start']
const main = async () => {
    let move = 'start';
    let board = await sendRequest(move);
    while (ROBOT_ACTIONS.includes(move)) {
        move = await nextMove(board);
        board = await sendRequest(move);
        await sleep(2500);
    }

    console.log("Result is: ", move);
};



async function sendRequest(command) {
    const res = await fetch("https://hub.ag3nts.org/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            apikey: AI_DEVS_API_KEY,
            task: "reactor",
            answer: {
                command: command
            },
        })
    });

    console.log("status:", res.status);

    const data = await res.json().catch(() => null);
    console.log("response body:", data);

    return data;
}



main().catch(console.error);