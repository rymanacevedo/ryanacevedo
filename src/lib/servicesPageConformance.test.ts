import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const expectedBookingUrl = "https://cal.com/avocadotechgroup/discovery-call";
const builtSiteDirectory = resolve(import.meta.dir, "../../dist");
const servicesPagePath = resolve(builtSiteDirectory, "services/index.html");
const requiredPhrases = [
	"Who owns the work?",
	"Will you sign an NDA?",
	"How do we work together day-to-day?",
	"How do you handle access and security?",
	"How does payment work?",
	"What if we're not a fit?",
	"Let's scope your project",
	"A 30-minute call: what you need shipped, whether I'm the right fit, and what a first engagement looks like. If it's a fit, you'll have a written proposal — scope, timeline, and price — within two business days. If I'm not, I'll tell you on the call.",
	"Engagements start at two weeks, fixed scope.",
];
const serviceOffers = [
	{
		name: "AI Product Sprint",
		pricing: "Fixed price, scoped on the intake call.",
	},
	{
		name: "Workflow Automation",
		pricing: "Scoped on the intake call.",
	},
	{
		name: "Embedded AI Engineer",
		pricing: "Scoped on the intake call.",
	},
] as const;

let servicesPage = "";
let decodedServicesPage = "";

function decodeCommonEntities(html: string): string {
	return html
		.replaceAll("&amp;", "&")
		.replaceAll("&#39;", "'")
		.replaceAll("&quot;", '"');
}

beforeAll(() => {
	const buildResult = Bun.spawnSync(["bun", "run", "build"], {
		stderr: "inherit",
		stdout: "inherit",
	});

	if (buildResult.exitCode !== 0) {
		throw new Error(
			`Production site build failed with exit code ${buildResult.exitCode}`,
		);
	}

	servicesPage = readFileSync(servicesPagePath, "utf8");
	decodedServicesPage = decodeCommonEntities(servicesPage);
});

describe("built /services page", () => {
	test("publishes the complete static services offer", () => {
		for (const phrase of requiredPhrases) {
			expect(decodedServicesPage).toContain(phrase);
		}
		const offerPanels = [
			...servicesPage.matchAll(/<article\b[\s\S]*?<\/article>/g),
		].map(([panel]) => decodeCommonEntities(panel));

		expect(offerPanels).toHaveLength(3);
		for (const offer of serviceOffers) {
			expect(
				offerPanels.some(
					(panel) =>
						panel.includes(offer.name) && panel.includes(offer.pricing),
				),
			).toBe(true);
		}

		expect(servicesPage).not.toMatch(/\$\s*\d/);
	});

	test("sends every services-page booking action straight to Cal.com", () => {
		const bookingHrefs = [
			...servicesPage.matchAll(
				/<a\b[^>]*href="([^"]*)"[^>]*>\s*Book (?:a|the) discovery call/gi,
			),
		].map(([, href]) => href);

		expect(bookingHrefs).toHaveLength(4);
		expect(bookingHrefs.every((href) => href === expectedBookingUrl)).toBe(
			true,
		);
	});

	test("publishes Services in the primary navigation site-wide", () => {
		const htmlFiles = [
			...new Bun.Glob("**/*.html").scanSync({
				cwd: builtSiteDirectory,
			}),
		];

		const pagesWithNav = htmlFiles
			.map((htmlFile) =>
				readFileSync(resolve(builtSiteDirectory, htmlFile), "utf8"),
			)
			.filter((page) => page.includes("<nav"));

		expect(pagesWithNav).not.toHaveLength(0);
		for (const page of pagesWithNav) {
			expect(page).toMatch(/href="\/services\/"[^>]*>Services<\/a>/);
		}
	});
});
