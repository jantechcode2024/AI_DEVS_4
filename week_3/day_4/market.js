import { processQuery } from "./src/executor.js";
import { consultant } from "./src/consultant.js";
import express from "express";
import path from "path";

import { findCsvValues, readCsv} from "./utils/csvReader.js"


const LLM = {
    model: consultant.model,
    instructions: consultant.instructions
};

const PORT = 3000;
const MAX_CHARS = 15000;


const app = express();
app.use(express.json());

app.post("/item_locations", async (req, res) => {
    const db = path.resolve("./workspace/items.csv");

    const { params } = req.body || {};

    console.log("Got request:", { params });
    if (!params || typeof params !== "string") {
        return res.status(400).json({ error: "Missing required field: msg (string)" });
    }
    const finalResult = [];

    try {
        const sessionID = 'f4c9a7e2-8b31-4d6f-9a2e-1c7b5d8f3a91'
        let csvContext = await readCsv(db);
        const query = { sessionID: sessionID, msg: params, csvContext };
        const items = await processQuery(query, LLM);        
        console.log('Found items...', items)

        const cities = await queryCities(items);      
        console.log("Final is ", cities)


        return res.json({
            output: cities.join(",")
        })
    } catch (err) {
        console.error("processing error:", err);
        return res.status(500).json({ error: err?.message ?? String(err) });
    }
});



async function queryCities(items) {
    const codes = await queryCityCodes(items);
    const cities = [];

    for (const code of codes) {
        const c = await findCsvValues(
            "./workspace/cities.csv",
            "code",
            code,
            "name"
        );
        cities.push(c);
    }

    return [...new Set(cities.flat())];
}

async function queryCityCodes(items) {
    const cityCodes = [];

    for (const item of JSON.parse(items)) {
        const c = await findCsvValues(
            "./workspace/connections.csv",
            "itemCode",
            item,
            "cityCode"
        );
        cityCodes.push(c);
    }

    return [...new Set(cityCodes.flat())];
}

app.listen(PORT, () => {
    console.log(`Post-agent server listening at http://localhost:${PORT}`);
});


