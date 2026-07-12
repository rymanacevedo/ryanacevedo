import { execFileSync } from "node:child_process";

export function branchHasUnmergedCommits(
	branch: string,
	options: { cwd?: string; head?: string } = {},
): boolean {
	const count = execFileSync(
		"git",
		["rev-list", "--count", `${options.head ?? "HEAD"}..${branch}`],
		{
			cwd: options.cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		},
	).trim();

	return Number.parseInt(count, 10) > 0;
}
