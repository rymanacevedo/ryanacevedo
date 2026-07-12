import { afterEach, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { branchHasUnmergedCommits } from "../.sandcastle/git-state";

const repos: string[] = [];

function git(cwd: string, ...args: string[]) {
	return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function createRepo() {
	const cwd = mkdtempSync(path.join(tmpdir(), "sandcastle-git-state-"));
	repos.push(cwd);
	git(cwd, "init", "-b", "master");
	git(cwd, "config", "user.name", "Sandcastle Test");
	git(cwd, "config", "user.email", "sandcastle@example.test");
	writeFileSync(path.join(cwd, "base.txt"), "base\n");
	git(cwd, "add", "base.txt");
	git(cwd, "commit", "-m", "base");
	return cwd;
}

function commit(cwd: string, file: string, contents: string) {
	writeFileSync(path.join(cwd, file), contents);
	git(cwd, "add", file);
	git(cwd, "commit", "-m", file);
}

afterEach(() => {
	for (const repo of repos.splice(0)) rmSync(repo, { recursive: true });
});

describe("branchHasUnmergedCommits", () => {
	it("returns false when the issue branch matches master", () => {
		const cwd = createRepo();
		git(cwd, "branch", "sandcastle/issue-1");

		expect(
			branchHasUnmergedCommits("sandcastle/issue-1", {
				cwd,
				head: "master",
			}),
		).toBe(false);
	});

	it("returns true when the issue branch is ahead", () => {
		const cwd = createRepo();
		git(cwd, "switch", "-c", "sandcastle/issue-1");
		commit(cwd, "issue.txt", "issue\n");

		expect(
			branchHasUnmergedCommits("sandcastle/issue-1", {
				cwd,
				head: "master",
			}),
		).toBe(true);
	});

	it("returns true when master and the issue branch diverged", () => {
		const cwd = createRepo();
		git(cwd, "switch", "-c", "sandcastle/issue-1");
		commit(cwd, "issue.txt", "issue\n");
		git(cwd, "switch", "master");
		commit(cwd, "master.txt", "master\n");

		expect(
			branchHasUnmergedCommits("sandcastle/issue-1", {
				cwd,
				head: "master",
			}),
		).toBe(true);
	});

	it("returns false after the issue branch is merged", () => {
		const cwd = createRepo();
		git(cwd, "switch", "-c", "sandcastle/issue-1");
		commit(cwd, "issue.txt", "issue\n");
		git(cwd, "switch", "master");
		git(cwd, "merge", "--ff-only", "sandcastle/issue-1");

		expect(
			branchHasUnmergedCommits("sandcastle/issue-1", {
				cwd,
				head: "master",
			}),
		).toBe(false);
	});
});
