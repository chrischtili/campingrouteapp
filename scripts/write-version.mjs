import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputArg = process.argv[2] || "dist/version.json";
const outputPath = resolve(process.cwd(), outputArg);

const readGitValue = (command) => {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
};

const commit = readGitValue("git rev-parse --short HEAD") || "unknown";
const branch = readGitValue("git rev-parse --abbrev-ref HEAD") || "unknown";
const builtAt = new Date().toISOString();
const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));

const versionInfo = {
  version: packageJson.version || "unknown",
  buildId: `${commit}-${builtAt}`,
  commit,
  branch,
  builtAt,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(versionInfo, null, 2)}\n`, "utf8");
