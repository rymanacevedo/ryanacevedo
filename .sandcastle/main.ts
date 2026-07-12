// Parallel Planner with Review — four-phase orchestration loop
//
// This template drives a multi-phase workflow:
//   Phase 1 (Plan):             A planning agent analyzes open issues, builds a
//                               dependency graph, and outputs a <plan> JSON
//                               listing unblocked issues with branch names.
//   Phase 2 (Execute + Review): For each issue, a sandbox is created via
//                               createSandbox(). The implementer runs first
//                               (100 iterations). If it produces commits, a
//                               reviewer runs in the same sandbox on the same
//                               branch (1 iteration). All issue pipelines run
//                               concurrently via Promise.allSettled().
//   Phase 3 (Merge):            A single agent merges all completed branches
//                               into the current branch.
//
// The outer loop repeats up to MAX_ITERATIONS times so that newly unblocked
// issues are picked up after each round of merges.
//
// Usage:
//   bunx tsx .sandcastle/main.ts
// Or add to package.json:
//   "scripts": { "sandcastle": "bunx tsx .sandcastle/main.ts" }

import { execFileSync } from "node:child_process";
import {
	chmodSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import dotenv from "dotenv";
import { z } from "zod";

import { branchHasUnmergedCommits } from "./git-state";
import { resolveSandboxUser } from "./platform";

dotenv.config({ path: path.resolve(".sandcastle/.env") });

// The planner emits its plan as JSON inside <plan> tags; Output.object extracts
// and validates it against this schema. We use Zod here, but any Standard
// Schema validator works just as well — Valibot, ArkType, etc. See
// https://standardschema.dev.
const planSchema = z.object({
	issues: z.array(
		z.object({ id: z.string().regex(/^\d+$/), title: z.string() }),
	),
});

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const sourceCodexHome =
	process.env.HOST_CODEX_HOME ??
	process.env.CODEX_HOME ??
	path.join(os.homedir(), ".codex");
const exportedCodexHome = path.join(
	os.tmpdir(),
	"ryanacevedo-sandcastle-codex",
	".codex",
);
const exportedRuntimeHome = path.join(
	os.tmpdir(),
	"ryanacevedo-sandcastle-runtime",
);
const sandboxCodexMount = "/mnt/host-codex";
const sandboxRuntimeMount = "/mnt/sandcastle-runtime";
const sandboxCodexHome = "/home/agent/.codex";
const sandboxTmpDir = "/home/agent/tmp";
const sandboxBunCacheDir = "/home/agent/.bun-cache";
const sandboxUser = resolveSandboxUser(
	process.platform,
	() => process.getuid?.() ?? 1000,
	() => process.getgid?.() ?? 1000,
);

const stageAgents = {
	planner: { model: "gpt-5.6-sol", effort: "high" },
	implementer: { model: "gpt-5.6-sol", effort: "medium" },
	reviewer: { model: "gpt-5.6-sol", effort: "medium" },
	merger: { model: "gpt-5.6-sol", effort: "high" },
} as const;

const codexAgent = (
	model: string,
	options: { effort: "low" | "medium" | "high" | "xhigh" },
) => sandcastle.codex(model, { ...options, captureSessions: false });

const isDryRun = process.argv.includes("--dry-run");
const runnerPermissionsScript = path.resolve(
	".sandcastle/runner-permissions.sh",
);

const verifyRunnerPermissions = () => {
	execFileSync("bash", [runnerPermissionsScript, "doctor"], {
		env: process.env,
		stdio: "inherit",
	});
};

const verifyTargetBranch = () => {
	const branch = execFileSync("git", ["branch", "--show-current"], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();

	if (branch !== "master") {
		console.error(
			`Sandcastle must run from master; the current branch is ${branch || "detached HEAD"}.`,
		);
		process.exit(1);
	}
};

const prepareHostCodexMount = () => {
	const sourceAuthPath = path.join(sourceCodexHome, "auth.json");
	const sourceConfigPath = path.join(sourceCodexHome, "config.toml");
	const exportedAuthPath = path.join(exportedCodexHome, "auth.json");
	const exportedConfigPath = path.join(exportedCodexHome, "config.toml");

	if (!existsSync(sourceAuthPath)) {
		console.error(
			[
				`Sandcastle requires Codex auth at ${sourceAuthPath}.`,
				"Run `codex login`, set CODEX_HOME, or set HOST_CODEX_HOME before running `.sandcastle/main.ts`.",
			].join("\n\n"),
		);
		process.exit(1);
	}

	mkdirSync(exportedCodexHome, { recursive: true });
	chmodSync(path.dirname(exportedCodexHome), 0o755);
	chmodSync(exportedCodexHome, 0o755);
	copyFileSync(sourceAuthPath, exportedAuthPath);
	chmodSync(exportedAuthPath, 0o644);

	if (existsSync(sourceConfigPath)) {
		copyFileSync(sourceConfigPath, exportedConfigPath);
		chmodSync(exportedConfigPath, 0o644);
	} else if (existsSync(exportedConfigPath)) {
		rmSync(exportedConfigPath);
	}

	return exportedCodexHome;
};

const prepareSandboxRuntimeMount = () => {
	const runtimeSetupPath = path.join(exportedRuntimeHome, "setup-sandbox.sh");
	mkdirSync(exportedRuntimeHome, { recursive: true });
	chmodSync(exportedRuntimeHome, 0o755);
	copyFileSync(".sandcastle/setup-sandbox.sh", runtimeSetupPath);
	chmodSync(runtimeSetupPath, 0o755);
	return exportedRuntimeHome;
};

const createDockerSandbox = () =>
	docker({
		imageName: "sandcastle:ryanacevedo",
		containerUid: sandboxUser.uid,
		containerGid: sandboxUser.gid,
		env: {
			CODEX_HOME: sandboxCodexHome,
			GH_TOKEN: process.env.GH_TOKEN ?? "",
			HOME: "/home/agent",
			TMPDIR: sandboxTmpDir,
			BUN_INSTALL_CACHE_DIR: sandboxBunCacheDir,
		},
		mounts: [
			{
				hostPath: prepareHostCodexMount(),
				sandboxPath: sandboxCodexMount,
				readonly: false,
			},
			{
				hostPath: prepareSandboxRuntimeMount(),
				sandboxPath: sandboxRuntimeMount,
				readonly: false,
			},
		],
	});

// Maximum number of plan→execute→merge cycles before stopping.
// Raise this if your backlog is large; lower it for a quick smoke-test run.
const MAX_ITERATIONS = 10;

const ensureHostGithubAuth = () => {
	if (!process.env.GH_TOKEN) {
		try {
			process.env.GH_TOKEN = execFileSync("gh", ["auth", "token"], {
				env: process.env,
				stdio: "pipe",
			})
				.toString()
				.trim();
		} catch {
			// The issue-list check below reports an actionable auth failure.
		}
	}

	try {
		execFileSync(
			"gh",
			[
				"issue",
				"list",
				"--state",
				"open",
				"--label",
				"ready-for-agent",
				"--limit",
				"1",
				"--json",
				"number,title,body,labels,comments",
			],
			{ env: process.env, stdio: "pipe" },
		);
	} catch (error) {
		const stderr =
			error instanceof Error &&
			"stderr" in error &&
			Buffer.isBuffer(error.stderr)
				? error.stderr.toString().trim()
				: "";

		console.error(
			[
				"Sandcastle requires host GitHub CLI auth before planning.",
				"Run `gh auth login -h github.com` or set `GH_TOKEN` before running `.sandcastle/main.ts`.",
				stderr,
			]
				.filter(Boolean)
				.join("\n\n"),
		);
		process.exit(1);
	}
};

const authHooks = {
	host: {
		onWorktreeReady: [
			{
				command: `bash ${JSON.stringify(runnerPermissionsScript)} prepare-worktree`,
			},
		],
	},
	sandbox: {
		onSandboxReady: [
			{
				command: `bash ${sandboxRuntimeMount}/setup-sandbox.sh --auth-only`,
			},
		],
	},
};

const dependencyHooks = {
	host: authHooks.host,
	sandbox: {
		onSandboxReady: [
			{
				command: `bash ${sandboxRuntimeMount}/setup-sandbox.sh`,
				timeoutMs: 600_000,
			},
		],
	},
};

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

if (isDryRun) {
	console.log("Sandcastle dry run: stage routing");
	for (const [stage, config] of Object.entries(stageAgents)) {
		console.log(`  ${stage}: ${config.model} [${config.effort}]`);
	}
	process.exit(0);
}

verifyRunnerPermissions();
verifyTargetBranch();
ensureHostGithubAuth();

for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
	console.log(`\n=== Iteration ${iteration}/${MAX_ITERATIONS} ===\n`);

	// -------------------------------------------------------------------------
	// Phase 1: Plan
	//
	// The planning agent reads the open issue list,
	// builds a dependency graph, and selects the issues that can be worked in
	// parallel right now (i.e., no blocking dependencies on other open issues).
	//
	// It outputs a <plan> JSON block — Output.object parses and validates it.
	// -------------------------------------------------------------------------
	const plan = await sandcastle.run({
		hooks: authHooks,
		sandbox: createDockerSandbox(),
		name: "planner",
		// One iteration is enough: the planner just needs to read and reason,
		// not write code. (Structured output requires maxIterations: 1.)
		maxIterations: 1,
		agent: codexAgent(stageAgents.planner.model, {
			effort: stageAgents.planner.effort,
		}),
		promptFile: "./.sandcastle/plan-prompt.md",
		// Extract and validate the <plan> JSON into a typed object. Throws
		// StructuredOutputError if the tag is missing, the JSON is malformed, or
		// validation fails — which aborts the loop.
		output: sandcastle.Output.object({ tag: "plan", schema: planSchema }),
	});

	const issues = plan.output.issues.map((issue) => ({
		...issue,
		branch: `sandcastle/issue-${issue.id}`,
	}));

	if (issues.length === 0) {
		// No unblocked work — either everything is done or everything is blocked.
		console.log("No unblocked issues to work on. Exiting.");
		break;
	}

	console.log(
		`Planning complete. ${issues.length} issue(s) to work in parallel:`,
	);
	for (const issue of issues) {
		console.log(`  ${issue.id}: ${issue.title} → ${issue.branch}`);
	}

	// -------------------------------------------------------------------------
	// Phase 2: Execute + Review
	//
	// For each issue, create a sandbox via createSandbox() so the implementer
	// and reviewer share the same sandbox instance per branch. The implementer
	// runs first; if it produces commits, the reviewer runs in the same sandbox.
	//
	// Promise.allSettled means one failing pipeline doesn't cancel the others.
	// -------------------------------------------------------------------------

	const settled = await Promise.allSettled(
		issues.map(async (issue) => {
			const sandbox = await sandcastle.createSandbox({
				branch: issue.branch,
				sandbox: createDockerSandbox(),
				hooks: dependencyHooks,
			});

			try {
				// Run the implementer
				const implement = await sandbox.run({
					name: "implementer",
					maxIterations: 100,
					agent: codexAgent(stageAgents.implementer.model, {
						effort: stageAgents.implementer.effort,
					}),
					promptFile: "./.sandcastle/implement-prompt.md",
					promptArgs: {
						TASK_ID: issue.id,
						ISSUE_TITLE: issue.title,
						BRANCH: issue.branch,
					},
				});

				// Recovered deterministic branches may already contain work from an
				// interrupted run even when this iteration produced no new commit.
				if (
					implement.commits.length > 0 ||
					branchHasUnmergedCommits(issue.branch)
				) {
					const review = await sandbox.run({
						name: "reviewer",
						maxIterations: 1,
						agent: codexAgent(stageAgents.reviewer.model, {
							effort: stageAgents.reviewer.effort,
						}),
						promptFile: "./.sandcastle/review-prompt.md",
						promptArgs: {
							BRANCH: issue.branch,
						},
					});

					// Merge commits from both runs so the merge phase sees all of them.
					// Each sandbox.run() only returns commits from its own run.
					return {
						...review,
						commits: [...implement.commits, ...review.commits],
					};
				}

				return implement;
			} finally {
				await sandbox.close();
			}
		}),
	);

	// Log any agents that threw (network error, sandbox crash, etc.).
	for (const [i, outcome] of settled.entries()) {
		if (outcome.status === "rejected") {
			const issue = issues[i];
			console.error(
				`  ✗ ${issue?.id ?? "unknown"} (${issue?.branch ?? "unknown"}) failed: ${outcome.reason}`,
			);
		}
	}

	// Include recovered deterministic branches with commits not yet in HEAD.
	const completedIssues = settled.flatMap((outcome, i) => {
		const issue = issues[i];
		if (
			!issue ||
			outcome.status !== "fulfilled" ||
			!branchHasUnmergedCommits(issue.branch)
		) {
			return [];
		}
		return [issue];
	});

	const completedBranches = completedIssues.map((i) => i.branch);

	console.log(
		`\nExecution complete. ${completedBranches.length} branch(es) with commits:`,
	);
	for (const branch of completedBranches) {
		console.log(`  ${branch}`);
	}

	if (completedBranches.length === 0) {
		console.log("No commits produced. Stopping to avoid a no-progress loop.");
		break;
	}

	// -------------------------------------------------------------------------
	// Phase 3: Merge
	//
	// One agent merges all completed branches into the current branch,
	// resolving any conflicts and running tests to confirm everything works.
	//
	// The {{BRANCHES}} and {{ISSUES}} prompt arguments are lists that the agent
	// uses to know which branches to merge and which issues to close.
	// -------------------------------------------------------------------------
	await sandcastle.run({
		hooks: dependencyHooks,
		sandbox: createDockerSandbox(),
		name: "merger",
		branchStrategy: { type: "merge-to-head" },
		maxIterations: 1,
		agent: codexAgent(stageAgents.merger.model, {
			effort: stageAgents.merger.effort,
		}),
		promptFile: "./.sandcastle/merge-prompt.md",
		promptArgs: {
			// A markdown list of branch names, one per line.
			BRANCHES: completedBranches.map((b) => `- ${b}`).join("\n"),
			// A markdown list of issue IDs and titles, one per line.
			ISSUES: completedIssues.map((i) => `- ${i.id}: ${i.title}`).join("\n"),
		},
	});

	console.log("\nBranches merged.");
}

console.log("\nAll done.");
