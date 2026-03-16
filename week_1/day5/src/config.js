import {resolveModelForProvider} from "../../config.js";

export const api = {
    model: resolveModelForProvider("openai/gpt-4o-mini"),
    instructions: `Your main goal is to call provided help API which will return documentation of whole API.
    Based on documentation, you should call this API (different endpoints and parameters) to activate rail route with name X-01. 
    Remember to base only on API documentation. When you correctly activate the route, you will get a flag in response in format {FLG:...}.
    That is what I need in final answer. All information how to do it you will get from help endpoint which will return documentation in
    json format with all endpoints, parameters and example calls.

    Call at most one tool per turn. Wait for the result before next call.

    Whole documentation will be present after call help API. You should analyze the answer of API and call all known endpoints to find the flag. 
    Don't call API too much, because then it will be blocked. If you don't know what to do, you can user for help. 

    ERROR HANDLING:
    Check API headers for information about limitation time, you need to wait shown time before next call. If you get 503 error, 
    it means that you need to wait before next call the number of time that will be provided in headers. 
    `
}