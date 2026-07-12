import { beforeAll, describe, test } from "bun:test";

import {
	assertNoInternalLinksToRoute,
	assertPhraseAbsentFromBuiltPages,
	assertPhrasePresentOnBuiltPage,
	assertPhrasePresentOnlyOnBuiltPage,
	assertStaticRedirect,
} from "./contentConformance";

const bannedPhrases = [
	"exisiting",
	"orgnization",
	"I'm looking to work Deno",
	"simple to setup in Bun",
	"issues find the",
	"Typescript",
	"I gave on you awhile ago",
	"package manager-you name it",
	"Building cools things",
	"Key Takeways",
	"Total Typescript",
	"walk though",
	"health fanatnic",
	"basic structure input/output",
	"try to setup a timer",
	"Lexis Nexis",
	"A mac book computer show casing",
	"clients coaching portfolios",
	"Wordpress",
	"Employeer Engagement as SCC",
	"1400%",
	"720% improvement",
	"78% increase",
	"reducing load times by 90%",
	"reducing design inconsistencies by 50%",
	"increasing feature adoption by 15%",
	"reducing production bugs by 50%",
	"improving code quality by 70%",
	"reducing latency by 35%",
	"cutting form submission errors by 70%",
	"reducing state-related bugs by 30%",
	"improving system performance by 70%",
	"reducing build times by 30%",
	"achieving a 97% improvement",
	"increasing search speeds by 90%",
	"reducing frontend bugs by 50%",
	"boosting online sales by 35%",
	"increase site speed by 90%",
	"25% increase in conversion rates",
	"40% increase in organic traffic",
	"increase velocity by 10x",
	"clients I've had the pleasure",
	"multiple businesses",
	"proven track record of building successful",
	"For fun, I like to build businesses",
	"200,000+ users",
	"over 200,000 users",
	"over 1 million lines",
	"over 50 endpoints",
	"roughly half of the entire codebase",
	"1,492 commits",
	"over 105,000 lines",
	"full engineering team a year",
	"17 agent-specific response types",
	"dozens of architectural decision records",
	"under an hour",
	"D rating to an A rating",
	"over 4,200 accessibility issues",
	"in seconds rather than days",
	"over 10,000 possible configurations",
];

const requiredPhrases = [
	{
		route: "/blog/tooling/bunaddiction",
		phrase: "A 78% reduction — about 4.5× faster!",
	},
	{
		route: "/work/clyde",
		phrase: "nine weeks — five LangGraph agents",
	},
	{
		route: "/work/clyde",
		phrase: "cutting iteration time by an estimated 5–10x",
	},
	{
		route: "/work/clyde",
		phrase: "compressed the core session prompt by roughly 40%",
	},
	{
		route: "/work/lexisnexis",
		phrase: "from 3 days to 5 hours (roughly 14× faster)",
	},
	{ route: "/work/lexisnexis", phrase: "doubling deployment frequency" },
	{
		route: "/work/national-park-college",
		phrase: "cutting the CSS bundle from 1MB to 30KB",
	},
	{ route: "/work/amplifire", phrase: "90% test coverage" },
	{ route: "/work/amplifire", phrase: "50+ code reviews monthly" },
];

const requiredEngagementLabels = [
	{ route: "/work/clyde", phrase: "Engagement: Direct client" },
	{ route: "/work/amplifire", phrase: "Engagement: Employment" },
	{ route: "/work/lexisnexis", phrase: "Engagement: Employment" },
	{
		route: "/work/national-park-college",
		phrase: "Engagement: Employment",
	},
	{ route: "/work/platform-one", phrase: "Engagement: Employment" },
	{ route: "/work/qt", phrase: "Engagement: Employment" },
];

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
});

describe("built-site content conformance", () => {
	test.each(bannedPhrases)("publishes no %p phrase", (phrase) => {
		assertPhraseAbsentFromBuiltPages(phrase);
	});

	test.each(requiredPhrases)("publishes $phrase on $route", ({
		route,
		phrase,
	}) => {
		assertPhrasePresentOnBuiltPage(route, phrase);
	});

	test.each(requiredEngagementLabels)("publishes $phrase on $route", ({
		route,
		phrase,
	}) => {
		assertPhrasePresentOnBuiltPage(route, phrase);
	});

	test("publishes the honest organizations heading", () => {
		assertPhrasePresentOnBuiltPage("/", "Organizations I've supported</h3>");
	});

	test("publishes the owner-mindset draft on About", () => {
		assertPhrasePresentOnBuiltPage(
			"/about",
			"I've founded and run my own products, so I work like an owner",
		);
	});

	test("publishes the Clyde estimate only in its case study", () => {
		assertPhrasePresentOnlyOnBuiltPage("/work/clyde", "5–10x");
	});

	test("redirects the retired entrepreneurship route to About", () => {
		assertStaticRedirect("/entrepreneurship", "/about");
		assertNoInternalLinksToRoute("/entrepreneurship");
	});
});
