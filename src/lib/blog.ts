const BLOG_CATEGORIES = [
	"ai-engineering",
	"infrastructure",
	"tooling",
] as const;

type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPostRoute {
	category: BlogCategory;
	slug: string;
	path: string;
}

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

function isBlogCategory(category: string): category is BlogCategory {
	return BLOG_CATEGORIES.some((blogCategory) => blogCategory === category);
}

export function getBlogPostRoute(id: string): BlogPostRoute {
	const [category, slug, ...rest] = id.split("/");
	if (!category || !slug || rest.length > 0 || !isBlogCategory(category)) {
		throw new Error(`Unknown blog category in post id: ${id}`);
	}

	return { category, slug, path: `/blog/${category}/${slug}` };
}

export function getBlogPostPath(id: string): string {
	return getBlogPostRoute(id).path;
}
