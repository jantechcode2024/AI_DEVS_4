import { chat, extractText } from "./api.js";
import { loadSessionMessages, saveSessionMessages } from "../utils/sessionStore.js";

const MAX_TOOL_ROUNDS = 10;

export const processQuery = async (query, { model, instructions }) => {
  const userMsg = typeof query === "string" ? query : query?.msg;
  const sessionId = query?.sessionID;
  const csvContext = query?.csvContext;

  if (!userMsg) throw new Error("processQuery: query.msg is required");
  if (!sessionId) throw new Error("processQuery: query.sessionID is required");

  const chatConfig = { model, instructions };
  const history = await loadSessionMessages(sessionId);

  const conversation = [...history];

  if (csvContext) {
    conversation.push({
      role: "system",
      content:
        "Masz dodatkowy kontekst z pliku CSV. Używaj go jako źródła danych do odpowiedzi.\n\n" +
        csvContext
    });
  }

  conversation.push({
    role: "user",
    content: userMsg
  });

  await saveSessionMessages(sessionId, conversation);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await chat({ ...chatConfig, input: conversation });

      const text = extractText(response) ?? "No response";

      conversation.push({ role: "assistant", content: text });
      await saveSessionMessages(sessionId, conversation);

      return text;
    
  }

  const text = "Max tool rounds reached.";
  conversation.push({ role: "assistant", content: text });
  await saveSessionMessages(sessionId, conversation);

  return text;
};