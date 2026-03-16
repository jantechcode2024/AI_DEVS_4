import { processQuery } from "./src/executor.js";
import { api } from "./src/config.js";
import { tools, handlers } from "./tools/index.js";
import express from "express";


const config = {
  model: api.model,
  tools,
  handlers,
  instructions: api.instructions
};


const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
 
  const { sessionID, msg } = req.body || {};

  console.log("Got request:", { sessionID, msg });
  if (!msg || typeof msg !== "string") {
    return res.status(400).json({ error: "Missing required field: msg (string)" });
  }

  try {
    // Option A: pass an object with sessionID + message (preferred if executor supports metadata)
    const query = { sessionID: sessionID ?? null, msg };

    // If your executor expects a plain string, change to: await processQuery(msg, config);
    console.log('Going to process query:', query);
    const result = await processQuery(query, config);

    return res.json(result);
  } catch (err) {
    console.error("processing error:", err);
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Post-agent server listening at http://localhost:${PORT}`);
});


