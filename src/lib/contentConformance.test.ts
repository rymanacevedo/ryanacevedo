import { describe, test } from "bun:test";

import {
	assertPhraseAbsentFromBuiltPages,
	assertPhrasePresentOnBuiltPages,
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
];

const requiredPhrases = [
	"LexisNexis",
	"from 3 days to 5 hours",
	"1MB to 30KB",
	"Organizations I've supported",
];

describe("built-site content conformance", () => {
	test.each(bannedPhrases)("publishes no %p phrase", (phrase) => {
		assertPhraseAbsentFromBuiltPages(phrase);
	});

	test.each(requiredPhrases)("publishes the required %p phrase", (phrase) => {
		assertPhrasePresentOnBuiltPages(phrase);
	});
});
