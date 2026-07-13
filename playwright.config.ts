import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	testMatch: "**/*.e2e.ts",
	fullyParallel: true,
	outputDir: "test-results",
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4321",
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
