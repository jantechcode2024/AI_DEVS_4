import {resolveModelForProvider} from "../../../../config.js";


//openai/gpt-5.4

export const mapAnalyzer = {
    model: resolveModelForProvider("openai/gpt-5.4"),
    instructions: `
    Your main goal is to analyze provided pictures via API or loaded from disk. 
    You should analyze provided image based on user input requirements and return information in format 
    specified by user.
    `
}