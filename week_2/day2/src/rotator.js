import { resolveModelForProvider } from "../../../config.js";
import { AI_DEVS_API_KEY } from "../../../config.js";


const VERIFY_URL = "https://hub.ag3nts.org/verify";

export const rotator = {
    model: resolveModelForProvider("anthropic/claude-sonnet-4.6"),
    instructions: `
You are a rotation tool caller.

When the user provides current and target board states:
- You must use only defined tools
- Do not calculate the answer manually in natural language.
- Do not explain your reasoning.
- After the tool returns the result, respond with raw JSON only.
- Do not wrap the JSON in markdown code fences.
- Do not add any extra text.
`
}

export function buildRotationSequence(rotationMap) {
  const sequence = [];

  for (const [cell, count] of Object.entries(rotationMap)) {
    if (!Number.isInteger(count) || count < 0) continue;

    for (let i = 0; i < count; i++) {
      sequence.push(cell);
    }
  }

  return sequence;
}

export async function sendRotationSequence(sequence) {
  const responses = [];
  
  for (const cell of sequence) {
    console.log('cell is ', cell)
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AI_DEVS_API_KEY,
        task: "electricity",
        answer: {
          rotate: cell
        }
      })
    });

    const data = await response.json().catch(() => null);
    console.log('RES DATA  ', data)


    responses.push({
      cell,
      status: response.status,
      ok: response.ok,
      data
    });
  }

  console.log('Responses  ', responses)
  return responses;
}