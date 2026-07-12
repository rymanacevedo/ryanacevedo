import { describe, expect, test } from "bun:test";

import {
	BLOG_REDIRECTS,
	formatPublishDate,
	getBlogPostPath,
	getBlogPostRoute,
} from "./blog";

describe("getBlogPostPath", () => {
	test("builds a category URL for a published post", () => {
		expect(getBlogPostPath("ai-engineering/vercelsdkai")).toBe(
			"/blog/ai-engineering/vercelsdkai",
		);
	});

	test("provides structured static-route parameters", () => {
		expect(getBlogPostRoute("ai-engineering/vercelsdkai")).toEqual({
			category: "ai-engineering",
			slug: "vercelsdkai",
			path: "/blog/ai-engineering/vercelsdkai",
		});
	});

	test("supports the launch category vocabulary", () => {
		expect(getBlogPostPath("infrastructure/infraimbuilding2024")).toBe(
			"/blog/infrastructure/infraimbuilding2024",
		);
		expect(getBlogPostPath("tooling/bunaddiction")).toBe(
			"/blog/tooling/bunaddiction",
		);
	});

	test("rejects a post in an unknown category folder", () => {
		expect(() => getBlogPostPath("2025/vercelsdkai")).toThrow(
			"Unknown blog category in post id: 2025/vercelsdkai",
		);
	});
});

describe("formatPublishDate", () => {
	test("renders a publish date for readers", () => {
		expect(formatPublishDate(new Date("2024-12-06T00:00:00.000Z"))).toBe(
			"December 6, 2024",
		);
	});
});

describe("BLOG_REDIRECTS", () => {
	test("redirects every legacy year URL to its category home", () => {
		expect(BLOG_REDIRECTS).toEqual({
			"/blog/posts/2024/infraimbuilding2024":
				"/blog/infrastructure/infraimbuilding2024",
			"/blog/posts/2025/vercelsdkai": "/blog/ai-engineering/vercelsdkai",
			"/blog/posts/2025/bunaddiction": "/blog/tooling/bunaddiction",
		});
	});
});
