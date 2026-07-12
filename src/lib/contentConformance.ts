import { expect } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const builtSiteDirectory = resolve(import.meta.dir, "../../dist");
const htmlFiles = new Bun.Glob("**/*.html");

function readBuiltPages(): Map<string, string> {
	const files = [...htmlFiles.scanSync({ cwd: builtSiteDirectory })];

	if (files.length === 0) {
		throw new Error(
			`No rendered HTML found in ${builtSiteDirectory}. Run the production build before the conformance suite.`,
		);
	}

	return new Map(
		files.map((page) => [
			page,
			readFileSync(resolve(builtSiteDirectory, page), "utf8"),
		]),
	);
}

let builtPages: Map<string, string> | undefined;

function getBuiltPages(): Map<string, string> {
	builtPages ??= readBuiltPages();
	return builtPages;
}

export function assertPhraseAbsentFromBuiltPages(phrase: string): void {
	const matchingPages = [...getBuiltPages().entries()]
		.filter(([, renderedHtml]) => renderedHtml.includes(phrase))
		.map(([page]) => page);

	expect(matchingPages).toEqual([]);
}

export function assertPhrasePresentOnBuiltPage(
	page: string,
	phrase: string,
): void {
	const route = page.replace(/^\/+|\/+$/g, "");
	const pageFile = route ? `${route}/index.html` : "index.html";
	const renderedHtml = getBuiltPages().get(pageFile);

	expect(renderedHtml, `No rendered page found for ${page}`).toContain(phrase);
}
