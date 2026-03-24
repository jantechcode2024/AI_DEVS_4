import { getInvalidFiles, getValidFiles } from "./src/validator.js"
import { processQuery } from "./src/executor.js";
import { api } from "./src/config.js"
import { AI_DEVS_API_KEY } from "../../config.js"

const VERIFY_URL = "https://hub.ag3nts.org/verify";


const config = {
    model: api.model,
    instructions: api.instructions,
};



const main = async () => {
    const res1 = await getInvalidFiles();
    const validF = await getValidFiles();

    const query = `You get as an input list of JSONS. Analyze each description and if you find any sings of incorrect data in it or incorrect behaviour you should return fileNames in form. V0001, V0003, V0004 itd. `;
    const res2 = await processQuery({
        text: query,
        toAnalyze: validF
    }, config);


    const merged = [...res1, ...res2];

    console.log(merged)


};

main().catch(console.error);