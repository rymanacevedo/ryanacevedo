type SitemapItem = {
	url: string;
	priority?: number | string;
	changefreq?: string;
	lastmod?: string;
};

type SerializeSitemapOptions = {
	siteUrl: string;
	buildDate: string;
	lastmodByPath?: Record<string, string>;
};

const ROOT_PATH = "/";
const EXCLUDED_PATH_PREFIXES = ["/book"];
const DEFAULT_PRIORITY = 0.9;
const ROOT_PRIORITY = 1.0;
const DEFAULT_CHANGE_FREQUENCY = "weekly";

function normalizePathname(itemUrl: string, siteUrl: string): string {
	const url = new URL(itemUrl, siteUrl);
	return url.pathname.replace(/\/$/, "") || ROOT_PATH;
}

function matchesPathPrefix(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isExcludedPath(pathname: string): boolean {
	return EXCLUDED_PATH_PREFIXES.some((prefix) =>
		matchesPathPrefix(pathname, prefix),
	);
}

export function serializeSitemapItem<T extends SitemapItem>(
	item: T,
	{ siteUrl, buildDate, lastmodByPath }: SerializeSitemapOptions,
): T | undefined {
	const pathname = normalizePathname(item.url, siteUrl);

	if (isExcludedPath(pathname)) {
		return undefined;
	}

	item.priority = `${siteUrl}/` === item.url ? ROOT_PRIORITY : DEFAULT_PRIORITY;
	item.changefreq = DEFAULT_CHANGE_FREQUENCY;
	item.lastmod = lastmodByPath?.[pathname] ?? buildDate;

	return item;
}
