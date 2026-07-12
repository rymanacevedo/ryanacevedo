import { beforeAll, describe, test } from "bun:test";

import {
	assertNoInternalLinksToRoute,
	assertPhraseAbsentFromBuiltPages,
	assertPhrasePresentOnBuiltPages,
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
	"clients I've had the pleasure",
	"multiple businesses",
	"proven track record of building successful",
	"For fun, I like to build businesses",
];

const requiredPhrases = [
	"LexisNexis",
	"from 3 days to 5 hours",
	"1MB to 30KB",
	"Organizations I've supported",
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

	test.each(requiredPhrases)("publishes the required %p phrase", (phrase) => {
		assertPhrasePresentOnBuiltPages(phrase);
	});

	test("redirects the retired entrepreneurship route to About", () => {
		assertStaticRedirect("/entrepreneurship", "/about");
		assertNoInternalLinksToRoute("/entrepreneurship");
	});
});
