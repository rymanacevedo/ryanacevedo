import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import { getContentLastmodByPath } from "./src/lib/seo/contentLastmod";
import { serializeSitemapItem } from "./src/lib/seo/sitemap";

const siteUrl = "https://ryanacevedo.com";
const buildDate = new Date().toISOString();
const lastmodByPath = {
	...getContentLastmodByPath("./src/content/posts", "/blog/posts"),
	...getContentLastmodByPath("./src/content/work", "/work"),
};

// https://astro.build/config
export default defineConfig({
	site: siteUrl,
	vite: {
		server: {
			watch: {
				ignored: ["**/.sandcastle/worktrees/**"],
			},
		},
	},
	integrations: [
		react(),
		sitemap({
			serialize(item) {
				return serializeSitemapItem(item, {
					siteUrl,
					buildDate,
					lastmodByPath,
				});
			},
		}),
	],
});
