import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

if (!baseURL) {
	throw new Error(
		"Set PLAYWRIGHT_BASE_URL to the URL reported by `bun run astro dev status`.",
	);
}

export default defineConfig({
	testDir: "./tests/e2e",
	testMatch: "**/*.e2e.ts",
	fullyParallel: true,
	outputDir: "test-results",
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL,
		colorScheme: "light",
		trace: "retain-on-failure",
	},
	projects: [
		{
			name: "mobile-320",
			use: { viewport: { width: 320, height: 568 } },
		},
		{
			name: "mobile-390",
			use: { viewport: { width: 390, height: 844 } },
		},
	],
});
