import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const builtSiteDirectory = resolve(import.meta.dir, "../../dist");

let aboutPage = "";
let entrepreneurshipRedirect = "";
let homePage = "";

function decodeCommonEntities(html: string): string {
	return html
		.replaceAll("&amp;", "&")
		.replaceAll("&#39;", "'")
		.replaceAll("&quot;", '"');
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

	aboutPage = decodeCommonEntities(
		readFileSync(resolve(builtSiteDirectory, "about/index.html"), "utf8"),
	);
	entrepreneurshipRedirect = readFileSync(
		resolve(builtSiteDirectory, "entrepreneurship/index.html"),
		"utf8",
	);
	homePage = decodeCommonEntities(
		readFileSync(resolve(builtSiteDirectory, "index.html"), "utf8"),
	);
});

describe("built /about page", () => {
	test("tells the founder story through practice, venture, and belief", () => {
		expect(aboutPage.match(/<h1\b/g)).toHaveLength(1);
		expect(aboutPage).toContain("Build the thing.");
		expect(aboutPage).toContain("Learn from the market.");
		expect(aboutPage).toContain("A founder's operating loop");
		expect(aboutPage).toContain("Start with a real problem");
		expect(aboutPage).toContain("Ship the smallest proof");
		expect(aboutPage).toContain("Featured venture");
		expect(aboutPage).toContain("Mobile Oil Hero");
		expect(aboutPage).toContain(
			"Software is leverage. The business was the outcome.",
		);

		const principleCards = [
			...aboutPage.matchAll(/<li class="principle"[\s\S]*?<\/li>/g),
		].map(([card]) => card);

		expect(principleCards).toHaveLength(3);
		expect(principleCards[0]).toContain("Start with a real problem");
		expect(principleCards[1]).toContain("Ship the smallest proof");
		expect(principleCards[2]).toContain("Iterate");
	});

	test("keeps the founder story credible and its routes connected", () => {
		expect(aboutPage).toContain(
			"Building businesses taught me how to build systems that work in the real world.",
		);
		expect(aboutPage).toContain(
			"I'm a first-time founder, and I won't pretend otherwise",
		);
		expect(aboutPage).toContain(
			'alt="Ryan Acevedo smiling in a beanie during a hot-air balloon ride"',
		);
		expect(aboutPage).toContain(
			'href="https://mobileoilhero.com" target="_blank" rel="noopener noreferrer"',
		);
		expect(aboutPage).toContain(
			'href="https://mobileoilhero.com/about-us" target="_blank" rel="noopener noreferrer"',
		);
		expect(aboutPage).not.toContain("For fun, I like to build businesses");
		expect(aboutPage).not.toContain("multiple businesses");

		expect(entrepreneurshipRedirect).toContain(
			'<meta http-equiv="refresh" content="0;url=/about">',
		);
		expect(entrepreneurshipRedirect).toContain('<a href="/about">');
		expect(homePage).toMatch(/href="\/about"[^>]*>View examples<\/a>/);
		expect(aboutPage).toMatch(/href="\/about\/"[^>]*>About<\/a>/);
		expect(homePage).not.toContain('href="/entrepreneurship"');
		expect(aboutPage).not.toContain('href="/entrepreneurship"');
	});
});
