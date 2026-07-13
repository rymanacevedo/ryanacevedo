import { mkdirSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const contentDirectory = fileURLToPath(
	new URL("../../src/content/work", import.meta.url),
);
const caseStudySlugs = readdirSync(contentDirectory)
	.filter((fileName) => fileName.endsWith(".md"))
	.map((fileName) => fileName.replace(/\.md$/, ""))
	.sort();

test.describe("case-study mobile readability", () => {
	for (const slug of caseStudySlugs) {
		test(`${slug} is readable without horizontal overflow`, async ({
			page,
		}, testInfo) => {
			const response = await page.goto(`/work/${slug}/`, {
				waitUntil: "networkidle",
			});

			expect(response?.ok()).toBe(true);
			await expect(page.locator(".case-study__body")).toBeVisible();
			await expect(page.locator(".case-study__image")).toBeVisible();
			await expect(
				page
					.locator(
						".case-study__body :is(p, h1, h2, h3, h4, h5, ul, ol, blockquote)",
					)
					.first(),
			).toContainText(/\S/);

			await page.evaluate(async () => {
				await document.fonts.ready;
				await Promise.all(
					Array.from(document.images).map(async (image) => {
						if (!image.complete) {
							await new Promise<void>((resolve) => {
								image.addEventListener("load", () => resolve(), { once: true });
								image.addEventListener("error", () => resolve(), {
									once: true,
								});
							});
						}
					}),
				);
			});
			expect(
				await page.locator(".case-study__image").evaluate((image) => {
					if (!(image instanceof HTMLImageElement)) return false;
					return (
						image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
					);
				}),
			).toBe(true);

			const metrics = await page
				.locator(".case-study__body")
				.evaluate((element) => {
					const styles = getComputedStyle(element);
					const fontSize = Number.parseFloat(styles.fontSize);
					const lineHeight = Number.parseFloat(styles.lineHeight);

					return {
						leadingRatio: lineHeight / fontSize,
						hasHorizontalOverflow:
							document.documentElement.scrollWidth >
							document.documentElement.clientWidth + 1,
					};
				});

			expect(metrics.leadingRatio).toBeGreaterThanOrEqual(1.61);
			expect(metrics.leadingRatio).toBeLessThanOrEqual(1.625);
			expect(metrics.hasHorizontalOverflow).toBe(false);
			await page.locator("astro-dev-toolbar").evaluateAll((toolbars) => {
				for (const toolbar of toolbars) toolbar.remove();
			});

			const screenshotDirectory = resolve(
				testInfo.project.outputDir,
				"screenshots",
				testInfo.project.name,
			);
			mkdirSync(screenshotDirectory, { recursive: true });
			const screenshotPath = resolve(screenshotDirectory, `${slug}.png`);
			await page.screenshot({
				animations: "disabled",
				fullPage: true,
				path: screenshotPath,
			});
			await testInfo.attach("full-page", {
				contentType: "image/png",
				path: screenshotPath,
			});
		});
	}
});
