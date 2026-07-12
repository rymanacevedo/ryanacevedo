import { expect } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const builtSiteDirectory = resolve(import.meta.dir, "../../dist");
const htmlFileGlob = new Bun.Glob("**/*.html");

type ExpectedLink = {
	href: string;
	label: string;
};

type ParsedLink = ExpectedLink & {
	ariaCurrent?: string;
	classes: string[];
};

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
		.filter(([, renderedHtml]) =>
			renderedHtml.replaceAll("&amp;", "&").includes(phrase),
		)
		.map(([pageFile]) => pageFile);
}

function getElementMarkup(
	renderedHtml: string,
	tagName: string,
	className?: string,
): string | undefined {
	return getElementMarkups(renderedHtml, tagName, className)[0];
}

function getElementMarkups(
	renderedHtml: string,
	tagName: string,
	className?: string,
): string[] {
	const elementPattern = new RegExp(
		`<${tagName}\\b[^>]*>[\\s\\S]*?</${tagName}>`,
		"g",
	);
	const elements = [...renderedHtml.matchAll(elementPattern)].map(
		([markup]) => markup,
	);
	if (!className) return elements;
	return elements.filter((markup) =>
		markup
			.match(/^<[^>]*class=["']([^"']*)["']/)?.[1]
			?.split(/\s+/)
			.includes(className),
	);
}

function getAttribute(
	attributes: string,
	attributeName: string,
): string | undefined {
	return attributes.match(new RegExp(`${attributeName}=["']([^"']*)["']`))?.[1];
}

function getClassNames(attributes: string): string[] {
	const className = getAttribute(attributes, "class");
	return className === undefined ? [] : className.split(/\s+/);
}

function getRequiredBuiltPageElement(
	pageRoute: string,
	tagName: string,
	className: string,
): string {
	const renderedHtml = getBuiltPages().get(getPageFileForRoute(pageRoute));
	const elementMarkup = renderedHtml
		? getElementMarkup(renderedHtml, tagName, className)
		: undefined;
	expect(
		elementMarkup,
		`No ${tagName}.${className} found on ${pageRoute}`,
	).toBeDefined();
	if (!elementMarkup) throw new Error("Expected built-page element was absent");
	return elementMarkup;
}

function getTextContent(markup: string): string {
	return markup
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function getNavigableBuiltPages(): Map<string, string> {
	return new Map(
		[...getBuiltPages()].filter(
			([, renderedHtml]) =>
				!renderedHtml.includes('<meta http-equiv="refresh"'),
		),
	);
}

function getRequiredPrimaryNav(
	pageFile: string,
	renderedHtml: string,
): { markup: string; lists: string[] } {
	const navMarkup = getElementMarkup(renderedHtml, "nav");
	expect(navMarkup, `No primary nav found in ${pageFile}`).toBeDefined();
	if (!navMarkup) throw new Error(`No primary nav found in ${pageFile}`);

	const navLists = getElementMarkups(navMarkup, "ul", "nav-items");
	expect(navLists, `Missing nav variants in ${pageFile}`).toHaveLength(2);
	return { markup: navMarkup, lists: navLists };
}

function getLinks(markup: string): ParsedLink[] {
	return [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(
		([, attributes = "", contents = ""]) => ({
			ariaCurrent: getAttribute(attributes, "aria-current"),
			classes: getClassNames(attributes),
			href: getAttribute(attributes, "href") ?? "",
			label: getTextContent(contents),
		}),
	);
}

export function assertPrimaryNavCurrentPageState(
	pageRoute: string,
	currentLinkLabel: string,
): void {
	const pageFile = getPageFileForRoute(pageRoute);
	const renderedHtml = getBuiltPages().get(pageFile);
	expect(renderedHtml, `No rendered page found for ${pageRoute}`).toBeDefined();
	if (!renderedHtml) throw new Error(`No rendered page found for ${pageRoute}`);

	const { lists: navLists } = getRequiredPrimaryNav(pageFile, renderedHtml);
	for (const navListMarkup of navLists) {
		expect(
			getLinks(navListMarkup).filter(
				({ ariaCurrent }) => ariaCurrent === "page",
			),
			`Unexpected current-page nav link in ${pageFile}`,
		).toMatchObject([{ label: currentLinkLabel }]);
	}
}

function toExpectedLinks(links: ParsedLink[]): ExpectedLink[] {
	return links.map(({ href, label }) => ({ href, label }));
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

export function assertElementTextEqualsOnBuiltPage(
	pageRoute: string,
	tagName: string,
	className: string,
	expectedText: string,
): void {
	const elementMarkup = getRequiredBuiltPageElement(
		pageRoute,
		tagName,
		className,
	);
	expect(getTextContent(elementMarkup)).toBe(expectedText);
}

export function assertPhraseAbsentFromBuiltPageElement(
	pageRoute: string,
	tagName: string,
	className: string,
	phrase: string,
): void {
	const elementMarkup = getRequiredBuiltPageElement(
		pageRoute,
		tagName,
		className,
	);
	expect(elementMarkup).not.toContain(phrase);
}

export function assertLinkInBuiltPageElement(
	pageRoute: string,
	tagName: string,
	className: string,
	expectedLink: ExpectedLink,
): void {
	const elementMarkup = getRequiredBuiltPageElement(
		pageRoute,
		tagName,
		className,
	);
	expect(toExpectedLinks(getLinks(elementMarkup))).toContainEqual(expectedLink);
}

export function assertTagCountInBuiltPageElement(
	pageRoute: string,
	elementTagName: string,
	className: string,
	descendantTagName: string,
	expectedCount: number,
): void {
	const elementMarkup = getRequiredBuiltPageElement(
		pageRoute,
		elementTagName,
		className,
	);
	expect(
		elementMarkup.match(new RegExp(`<${descendantTagName}\\b`, "g")) ?? [],
	).toHaveLength(expectedCount);
}

export function assertElementCountOnBuiltPage(
	pageRoute: string,
	tagName: string,
	expectedCount: number,
): void {
	const pageFile = getPageFileForRoute(pageRoute);
	const renderedHtml = getBuiltPages().get(pageFile);
	const matches = renderedHtml?.match(new RegExp(`<${tagName}\\b`, "g")) ?? [];

	expect(renderedHtml, `No rendered page found for ${pageRoute}`).toBeDefined();
	expect(matches).toHaveLength(expectedCount);
}

export function assertPrimaryNavConformsOnBuiltPages(
	expectedLinks: ExpectedLink[],
	ctaLabel: string,
	githubHref: string,
): void {
	for (const [pageFile, renderedHtml] of getNavigableBuiltPages()) {
		const { lists: navLists, markup: navMarkup } = getRequiredPrimaryNav(
			pageFile,
			renderedHtml,
		);
		for (const navListMarkup of navLists) {
			const navLinks = getLinks(navListMarkup);
			expect(
				toExpectedLinks(navLinks),
				`Unexpected primary nav links in ${pageFile}`,
			).toEqual(expectedLinks);
			expect(
				navLinks.find(({ label }) => label === ctaLabel)?.classes,
				`The ${ctaLabel} link is not a pill in ${pageFile}`,
			).toContain("book-cta");
		}
		expect(getLinks(navMarkup).some(({ href }) => href === githubHref)).toBe(
			true,
		);
	}
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
