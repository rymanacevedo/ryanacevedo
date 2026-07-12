import { describe, expect, test } from "bun:test";

import { buildBookingUrl } from "./intakeFunnel";

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
