import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function askYesNo(question) {
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const answer = (await rl.question(`${question} (Y/N): `)).trim().toLowerCase();
      if (answer === "y" || answer === "yes") return true;
      if (answer === "n" || answer === "no") return false;
      console.log("Please type Y or N.");
    }
  } finally {
    rl.close();
  }
}