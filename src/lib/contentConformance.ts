import { expect } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const builtSiteDirectory = resolve(import.meta.dir, "../../dist");
const htmlFileGlob = new Bun.Glob("**/*.html");

function readBuiltPages(): Map<string, string> {
	const pageFiles = [...htmlFileGlob.scanSync({ cwd: builtSiteDirectory })];

	if (pageFiles.length === 0) {
		throw new Error(
			`No rendered HTML found in ${builtSiteDirectory}. Run the production build before the conformance suite.`,
		);
	}

	return new Map(
		pageFiles.map((pageFile) => [
			pageFile,
			readFileSync(resolve(builtSiteDirectory, pageFile), "utf8"),
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
		.map(([pageFile]) => pageFile);

	expect(matchingPages).toEqual([]);
}

export function assertPhrasePresentOnBuiltPages(phrase: string): void {
	const isPresent = [...getBuiltPages().values()].some((renderedHtml) =>
		renderedHtml.includes(phrase),
	);

	expect(isPresent).toBe(true);
}

export function assertPhrasePresentOnBuiltPage(
	pageRoute: string,
	phrase: string,
): void {
	const route = pageRoute.replace(/^\/+|\/+$/g, "");
	const pageFile = route ? `${route}/index.html` : "index.html";
	const renderedHtml = getBuiltPages().get(pageFile);

	expect(renderedHtml, `No rendered page found for ${pageRoute}`).toContain(
		phrase,
	);
}
