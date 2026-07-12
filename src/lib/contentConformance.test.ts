import { beforeAll, describe, test } from "bun:test";

import {
	assertPhraseAbsentFromBuiltPages,
	assertPhrasePresentOnBuiltPage,
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
];

const requiredPagePhrases = [
	{
		page: "/work/lexisnexis/",
		phrase:
			"Accelerated training of a machine learning model in Python, reducing processing time from 3 days to 5 hours, a 720% improvement.",
	},
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

	test.each(requiredPagePhrases)("publishes $phrase verbatim on $page", ({
		page,
		phrase,
	}) => {
		assertPhrasePresentOnBuiltPage(page, phrase);
	});
});
