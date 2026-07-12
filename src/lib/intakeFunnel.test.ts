import { describe, expect, test } from "bun:test";

import { buildBookingUrl, buildBrief, buildFormPayload } from "./intakeFunnel";

describe("buildBrief", () => {
	test("builds a brief for the selected company stage", () => {
		expect(buildBrief({ email: "", stage: "Scaling" })).toBe("Stage: Scaling");
	});

	test("builds a brief from all three funnel answers", () => {
		expect(
			buildBrief({
				email: "",
				stage: "Scaling",
				timeframe: "1–3 months",
				start: "ASAP",
			}),
		).toBe("Stage: Scaling · Timeframe: 1–3 months · Start: ASAP");
	});

	test("omits unanswered parts from partial briefs", () => {
		expect(buildBrief({ email: "", timeframe: "3–6 months" })).toBe(
			"Timeframe: 3–6 months",
		);
		expect(
			buildBrief({ email: "", stage: "Enterprise", start: "1–2 weeks" }),
		).toBe("Stage: Enterprise · Start: 1–2 weeks");
	});

	test("returns no brief when no answers are selected", () => {
		expect(buildBrief({ email: "" })).toBe("");
		expect(buildBrief({ email: "", stage: "", timeframe: "", start: "" })).toBe(
			"",
		);
	});
});

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

	test("adds the selected stage to the booking notes", () => {
		expect(
			buildBookingUrl({ email: "ryan@example.com", stage: "Just starting" }),
		).toBe(
			"https://cal.com/avocadotechgroup/discovery-call?email=ryan%40example.com&notes=Stage%3A+Just+starting",
		);
	});

	test("omits booking notes when no stage is selected", () => {
		const bookingUrl = new URL(buildBookingUrl({ email: "ryan@example.com" }));
		const emptyStageUrl = new URL(
			buildBookingUrl({ email: "ryan@example.com", stage: "" }),
		);

		expect(bookingUrl.searchParams.has("notes")).toBe(false);
		expect(emptyStageUrl.searchParams.has("notes")).toBe(false);
	});

	test("adds the complete brief to booking notes", () => {
		const bookingUrl = new URL(
			buildBookingUrl({
				email: "ryan@example.com",
				stage: "Scaling",
				timeframe: "1–3 months",
				start: "ASAP",
			}),
		);

		expect(bookingUrl.searchParams.get("notes")).toBe(
			"Stage: Scaling · Timeframe: 1–3 months · Start: ASAP",
		);
	});

	test("adds timeframe-only answers to booking notes", () => {
		const bookingUrl = new URL(
			buildBookingUrl({ email: "ryan@example.com", timeframe: "3–6 months" }),
		);

		expect(bookingUrl.searchParams.get("notes")).toBe("Timeframe: 3–6 months");
	});
});

describe("buildFormPayload", () => {
	test("builds a Netlify payload from the funnel answers", () => {
		const payload = buildFormPayload({
			email: "ryan+website@example.com",
			stage: "Scaling",
			timeframe: "1–3 months",
			start: "ASAP",
		});

		expect(Object.fromEntries(new URLSearchParams(payload))).toEqual({
			"form-name": "project-intake",
			email: "ryan+website@example.com",
			stage: "Scaling",
			timeframe: "1–3 months",
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

	test("includes a populated honeypot value", () => {
		const payload = buildFormPayload(
			{ email: "bot@example.com" },
			{ botField: "spam" },
		);

		expect(new URLSearchParams(payload).get("bot-field")).toBe("spam");
	});
});
