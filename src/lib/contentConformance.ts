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

function normalizeRoute(route: string): string {
	return route.replace(/^\/+|\/+$/g, "");
}

function getPageFileForRoute(route: string): string {
	const normalizedRoute = normalizeRoute(route);
	return normalizedRoute ? `${normalizedRoute}/index.html` : "index.html";
}

function getPageFilesContainingPhrase(phrase: string): string[] {
	return [...getBuiltPages().entries()]
		.filter(([, renderedHtml]) => renderedHtml.includes(phrase))
		.map(([pageFile]) => pageFile);
}

export function assertPhraseAbsentFromBuiltPages(phrase: string): void {
	expect(getPageFilesContainingPhrase(phrase)).toEqual([]);
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
	const pageFile = getPageFileForRoute(pageRoute);
	const renderedHtml = getBuiltPages().get(pageFile);

	expect(renderedHtml, `No rendered page found for ${pageRoute}`).toContain(
		phrase,
	);
}

export function assertPhrasePresentOnlyOnBuiltPage(
	pageRoute: string,
	phrase: string,
): void {
	const pageFile = getPageFileForRoute(pageRoute);

	expect(getPageFilesContainingPhrase(phrase)).toEqual([pageFile]);
}

export function assertStaticRedirect(fromRoute: string, toRoute: string): void {
	const pageFile = getPageFileForRoute(fromRoute);
	const renderedHtml = getBuiltPages().get(pageFile);

	expect(renderedHtml, `No redirect artifact found for ${fromRoute}`).toContain(
		`<meta http-equiv="refresh" content="0;url=${toRoute}">`,
	);
	expect(renderedHtml).toContain(`<a href="${toRoute}">`);
}

export function assertNoInternalLinksToRoute(
	pageRoute: string,
	siteOrigin = "https://ryanacevedo.com",
): void {
	const normalizedPageRoute = normalizeRoute(pageRoute);
	const redirectPageFile = getPageFileForRoute(pageRoute);
	const matchingPages = [...getBuiltPages().entries()]
		.filter(([pageFile]) => pageFile !== redirectPageFile)
		.filter(([pageFile, renderedHtml]) => {
			const pageUrl = new URL(pageFile.replace(/index\.html$/, ""), siteOrigin);
			const linkedUrls = [...renderedHtml.matchAll(/href=["']([^"']+)["']/g)]
				.map(([, href]) => href)
				.filter((href): href is string => href !== undefined)
				.map((href) => new URL(href, pageUrl));

			return linkedUrls.some(
				(linkedUrl) =>
					linkedUrl.origin === siteOrigin &&
					normalizeRoute(linkedUrl.pathname) === normalizedPageRoute,
			);
		})
		.map(([pageFile]) => pageFile);

	expect(matchingPages).toEqual([]);
}
