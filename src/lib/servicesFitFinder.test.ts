import { describe, expect, test } from "bun:test";
import {
	BOOKING_URL,
	buildServiceBookingUrl,
	getOfferChoiceState,
	selectOffer,
} from "./servicesFitFinder";

describe("services fit-finder", () => {
	test("selects an offer and switches the revealed offer", () => {
		const sprintSelected = selectOffer({}, "sprint");

		expect(getOfferChoiceState(sprintSelected, "sprint")).toEqual({
			pressed: true,
			actionText: "Selected ✓",
			panelRevealed: true,
		});
		expect(getOfferChoiceState(sprintSelected, "automation")).toEqual({
			pressed: false,
			actionText: "See how →",
			panelRevealed: false,
		});

		const automationSelected = selectOffer(sprintSelected, "automation");
		expect(
			getOfferChoiceState(automationSelected, "sprint").panelRevealed,
		).toBe(false);
		expect(
			getOfferChoiceState(automationSelected, "automation").panelRevealed,
		).toBe(true);
	});

	test("builds bare and offer-scoped Cal.com booking URLs", () => {
		expect(buildServiceBookingUrl()).toBe(BOOKING_URL);
		expect(buildServiceBookingUrl("sprint")).toBe(
			"https://cal.com/avocadotechgroup/discovery-call?notes=Interested+in%3A+AI+Product+Sprint",
		);
	});
});
