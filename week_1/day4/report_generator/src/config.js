
import { resolveModelForProvider } from "../../../config.js";

export const api = {
    model: resolveModelForProvider("openai/gpt-4o-mini"),
    instructions: `You are an extraction agent. Your task is to prepare values for a “package send report” by reading the provided INPUT FILE and its attachments. Give me an overview of the content and extract the following information.

TOOLS (only):
- read_file
    `
  };