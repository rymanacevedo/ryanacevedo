import { describe, expect, test } from "bun:test";

import { buildBookingUrl, buildFormPayload } from "./intakeFunnel";

describe("buildBookingUrl", () => {
	test("builds the discovery-call URL with the visitor email", () => {
		expect(buildBookingUrl({ email: "ryan@example.com" })).toBe(
			"https://cal.com/avocadotechgroup/discovery-call?email=ryan%40example.com",
		);
	});

	test("URL-encodes special characters in the email", () => {
		expect(buildBookingUrl({ email: "ryan+website@example.com" })).toBe(
			"https://cal.com/avocadotechgroup/discovery-call?email=ryan%2Bwebsite%40example.com",
		);
	});
});

describe("buildFormPayload", () => {
	test("builds a Netlify payload from the funnel answers", () => {
		const payload = buildFormPayload({
			email: "ryan+website@example.com",
			stage: "scaling",
			timeframe: "1-3 months",
			start: "ASAP",
		});

		expect(Object.fromEntries(new URLSearchParams(payload))).toEqual({
			"form-name": "project-intake",
			email: "ryan+website@example.com",
			stage: "scaling",
			timeframe: "1-3 months",
			start: "ASAP",
			"bot-field": "",
		});
	});

	test("uses empty values for unanswered funnel questions", () => {
		const payload = buildFormPayload({ email: "ryan@example.com" });

		expect(Object.fromEntries(new URLSearchParams(payload))).toEqual({
			"form-name": "project-intake",
			email: "ryan@example.com",
			stage: "",
			timeframe: "",
			start: "",
			"bot-field": "",
		});
	});
});
