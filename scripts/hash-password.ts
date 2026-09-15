// Erzeugt ADMIN_PASSWORD_HASH und SESSION_SECRET für die .env / Vercel.
//
//   npx tsx scripts/hash-password.ts "dein-starkes-passwort"
//
// Ohne Argument wird interaktiv gefragt. Das Klartext-Passwort landet nirgends
// gespeichert — nur der Hash wird ausgegeben.
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { hashPassword } from "../lib/password";

async function getPassword(): Promise<string> {
  const arg = process.argv[2];
  if (arg) return arg;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question("Neues Admin-Passwort: ", (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

async function main() {
  const password = (await getPassword()).trim();
  if (password.length < 12) {
    console.warn("\n⚠  Empfehlung: mindestens 12 Zeichen für ein Admin-Passwort.\n");
  }
  console.log("\n# In .env und in den Vercel-Environment-Variablen eintragen:\n");
  console.log(`ADMIN_PASSWORD_HASH="${hashPassword(password)}"`);
  console.log(`SESSION_SECRET="${randomBytes(32).toString("hex")}"`);
  console.log("");
}

main();
