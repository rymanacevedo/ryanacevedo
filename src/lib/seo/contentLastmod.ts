import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { parse } from "yaml";

type ContentFrontmatter = {
	publishDate?: string | Date;
};

const FRONTMATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---/;
const CONTENT_EXTENSIONS = new Set([".md", ".mdx"]);

function toIsoDate(value: string | Date): string {
	return new Date(value).toISOString();
}

function slugFromPath(contentDir: string, filePath: string): string {
	return relative(contentDir, filePath)
		.slice(0, -extname(filePath).length)
		.split(sep)
		.join("/");
}

function listContentFiles(dir: string): string[] {
	return readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter(
			(entry) => entry.isFile() && CONTENT_EXTENSIONS.has(extname(entry.name)),
		)
		.map((entry) => join(entry.parentPath, entry.name));
}

function parseContentFrontmatter(content: string): ContentFrontmatter | null {
	const frontmatter = FRONTMATTER_PATTERN.exec(content)?.[1];
	if (!frontmatter) {
		return null;
	}

	const data = parse(frontmatter);
	if (!data || typeof data !== "object") {
		return null;
	}

	return data as ContentFrontmatter;
}

export function getContentLastmodByPath(
	contentDir: string,
	urlPrefix: string,
): Record<string, string> {
	const lastmodByPath: Record<string, string> = {};

	for (const filePath of listContentFiles(contentDir)) {
		const data = parseContentFrontmatter(readFileSync(filePath, "utf8"));
		if (!data?.publishDate) continue;

		lastmodByPath[`${urlPrefix}/${slugFromPath(contentDir, filePath)}`] =
			toIsoDate(data.publishDate);
	}

	return lastmodByPath;
}
