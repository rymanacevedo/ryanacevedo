import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const builtSiteDirectory = resolve(import.meta.dir, "../../dist");

function readBuiltFile(relativePath: string): string {
	return readFileSync(resolve(builtSiteDirectory, relativePath), "utf8");
}

function readBuiltPage(route: string): string {
	const file = route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
	return readBuiltFile(file);
}

function normalizeText(html: string): string {
	return html.replace(/\s+/g, " ");
}

beforeAll(() => {
	const buildResult = Bun.spawnSync(["bun", "run", "build"], {
		stderr: "inherit",
		stdout: "inherit",
	});

	if (buildResult.exitCode !== 0) {
		throw new Error(
			`Production site build failed with exit code ${buildResult.exitCode}`,
		);
	}
});

describe("approved founder-story copy", () => {
	test("publishes the approved founder paragraph on About", () => {
		expect(normalizeText(readBuiltPage("/about"))).toContain(
			"I'm a first-time founder, and I won't pretend otherwise — I'm figuring it out the way an engineer does: break it down, solve one piece at a time, don't stop until it works. Running Mobile Oil Hero taught me what code costs and what it's worth, and I make tradeoffs like it's my money on the line — because at my own company, it is.",
		);
	});

	test("publishes the approved Entrepreneurship card line on the homepage", () => {
		expect(normalizeText(readBuiltPage("/"))).toContain(
			"I run my own business, Mobile Oil Hero — so I know what software costs and what it's worth, and I build like it's my money on the line.",
		);
	});

	test("does not publish the superseded plural-business founder claim", () => {
		const builtPages = [
			...new Bun.Glob("**/*.html").scanSync({
				cwd: builtSiteDirectory,
			}),
		].map((page) => readBuiltFile(page));

		expect(
			builtPages.some((page) =>
				page.includes("I've founded and run my own products"),
			),
		).toBe(false);
	});
});
