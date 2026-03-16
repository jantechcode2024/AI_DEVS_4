
import { resolveModelForProvider } from "../../../config.js";

export const api = {
    model: resolveModelForProvider("stepfun/step-3.5-flash:free"),
    instructions: `You are detective and searching for suspect. We will provide you list of suspects and based on this you will use only tools you have defined to find one suspect who is guilty. 
    You can ask for any information about suspects using available tools. 
    Always use the available tools to interact with suspects. 
    Be concise in your responses.`
  };