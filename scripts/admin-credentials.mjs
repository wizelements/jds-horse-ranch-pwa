import { scryptSync, randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Supply the chosen password through stdin, never a command-line argument.
// The resulting bundle is private, ignored by Git, and never printed.
if (process.stdin.isTTY) {
  process.stderr.write("Pipe the chosen owner password to stdin using your password manager or a hidden-input prompt. Do not put it in a shell command or arguments.\n");
  process.exit(1);
}
let password = "";
for await (const chunk of process.stdin) { password += chunk.toString("utf8"); if(password.length>512)throw new Error("Password input is too long."); }
password = password.replace(/\r?\n$/, "");
if (password.length < 14 || password.length > 256) { process.stderr.write("Choose a password between 14 and 256 characters.\n"); process.exit(1); }
const salt = randomBytes(32).toString("hex"), target = resolve(process.argv[2] || ".env.owner.local");
const settings = { ADMIN_PASSWORD_SALT_V2:salt, ADMIN_PASSWORD_HASH_V2:scryptSync(password,salt,64).toString("hex"),
  SESSION_TOKEN_SECRET_V2:randomBytes(48).toString("base64url"), CALENDAR_ENCRYPTION_KEY:randomBytes(32).toString("base64"), CRON_SECRET:randomBytes(48).toString("base64url") };
password = "";
await writeFile(target,Object.entries(settings).map(([name,value])=>`${name}=${value}`).join("\n")+"\n",{mode:0o600,flag:"wx"});
process.stdout.write("Owner configuration bundle created with owner-only file permissions. Import its values through the deployment account, then remove the local bundle. Keep the calendar encryption key in the owner's password manager; changing it disconnects stored calendar access.\n");
