import { describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const shellScripts = [
	".sandcastle/runner-permissions.sh",
	".sandcastle/setup-sandbox.sh",
];

describe("Sandcastle runner scripts", () => {
	it("keeps every shell entrypoint syntactically valid", () => {
		expect(() => execFileSync("bash", ["-n", ...shellScripts])).not.toThrow();
	});

	it("keeps the embedded dependency verifier valid JavaScript", () => {
		const setupScript = readFileSync(".sandcastle/setup-sandbox.sh", "utf8");
		const embeddedScript = setupScript.match(
			/\bnode <<'NODE'\n([\s\S]*?)\nNODE\n/,
		)?.[1];
		expect(embeddedScript).toBeDefined();

		const directory = mkdtempSync(path.join(tmpdir(), "sandcastle-script-"));
		const scriptPath = path.join(directory, "verify-native-dependencies.js");
		try {
			writeFileSync(scriptPath, embeddedScript ?? "");
			expect(() => execFileSync("node", ["--check", scriptPath])).not.toThrow();
		} finally {
			rmSync(directory, { recursive: true });
		}
	});
});
