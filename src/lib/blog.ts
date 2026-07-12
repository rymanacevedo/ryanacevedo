const BLOG_CATEGORIES = new Set([
	"ai-engineering",
	"infrastructure",
	"tooling",
]);

export const BLOG_REDIRECTS = {
	"/blog/posts/2024/infraimbuilding2024":
		"/blog/infrastructure/infraimbuilding2024",
	"/blog/posts/2025/vercelsdkai": "/blog/ai-engineering/vercelsdkai",
	"/blog/posts/2025/bunaddiction": "/blog/tooling/bunaddiction",
} as const;

const PUBLISH_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});

export function formatPublishDate(date: Date): string {
	return PUBLISH_DATE_FORMAT.format(date);
}

export function getBlogPostRoute(id: string): {
	category: string;
	slug: string;
	path: string;
} {
	const [category, slug, ...rest] = id.split("/");
	if (!category || !slug || rest.length > 0 || !BLOG_CATEGORIES.has(category)) {
		throw new Error(`Unknown blog category in post id: ${id}`);
	}

	return { category, slug, path: `/blog/${category}/${slug}` };
}

export function getBlogPostPath(id: string): string {
	return getBlogPostRoute(id).path;
}
