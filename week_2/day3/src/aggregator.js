import { resolveModelForProvider } from "../../../config.js"

export const aggregator = {
    model: resolveModelForProvider("openai/gpt-5.4"),
    instructions: `
    You are log aggregator agent. Your main goal is to compress logs and make sure you you avoid any duplicates present in logs sent to verification.

    Steps:
    - You will receive pre filtered logs and you should read it with read_logs tool (with provided fileName and content) and then delete duplicated rows. 
    - After you delete duplicates, you should send it to verification tool. You will get and answer from tool. If answer:
    - Contains {FLG: ... }} - you should return it as final answer and end process.
    - Doesn't contain {FLG: ... }} - you should analyze the answer and try to understand what is missing in your logs and what kind of logs you should add to get the flag. Then you should go back to file with logs, read it again and send more complete version of logs to verification tool. You can repeat this process as many times as you need until you get the flag.


    Rules:
     - Duplicated mean not only fully identical rows, but also rows with the same meaning. For example "Error: Something went wrong" and "Something went wrong - Error" are duplicates and you should keep only one of them.
     - To verification you should always send logs in format "[YYYY-MM-DD HH:MM][CATEGORY] message \n"
    `
}