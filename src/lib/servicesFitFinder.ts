import { BOOKING_URL } from "./intakeFunnel";

export { BOOKING_URL };

export const SERVICE_OFFERS = [
	{
		id: "sprint",
		name: "AI Product Sprint",
		tagline: "I build it, you ship it",
		duration: "2 weeks · fixed scope",
		need: "One AI feature, live in production",
		needDetail:
			"You can name the feature in a sentence. It needs to be real, fast.",
		problem:
			"You need a production AI feature — or a validated working prototype — without spending a quarter hiring.",
		deliverables:
			"A shipped, working feature in your repo and your infrastructure. Deployed, tested, with a handoff walkthrough.",
		goodFit: [
			"You have one scoped AI feature that needs to be real",
			"You can describe it in a sentence",
			"Two weeks of focused work beats three months of hiring",
		],
		proof:
			"Proof: a production AI app scoped, built, and shipped in two weeks.",
		pricing: "Fixed price, scoped on the intake call.",
	},
	{
		id: "automation",
		name: "Workflow Automation",
		tagline: "Your team, unblocked",
		duration: "2–4 weeks",
		need: "Hours of manual work, automated",
		needDetail:
			"Triage, data entry, documents, reporting — work AI could be doing.",
		problem:
			"Your team burns hours on repetitive internal work, and nobody in-house has the time or AI depth to automate it.",
		deliverables:
			"Working automations wired into the tools you already use, and your team trained to run them.",
		goodFit: [
			"A repetitive process is eating real team hours every week",
			"The process lives in tools you already use",
			"You want your team trained on it, not dependent on me",
		],
		proof:
			"Proof: SCC's AI integration — built, adopted, and in daily use after two weeks.",
		pricing: "Scoped on the intake call.",
	},
	{
		id: "embedded",
		name: "Embedded AI Engineer",
		tagline: "I build with you",
		duration: "Ongoing · 6+ week initial block",
		need: "AI shipping every week",
		needDetail:
			"A stream of AI product work, not one feature — without months of hiring.",
		problem:
			"Your AI ambitions outpace the team's bandwidth or AI depth. You need AI product work shipping continuously.",
		deliverables:
			"I join the team — repo, standups, roadmap — and ship production AI features, with knowledge transfer built into the working style.",
		goodFit: [
			"Your AI roadmap is bigger than your team's bandwidth",
			"You want features shipping while you hire, or instead of hiring",
			"You value knowledge transfer, not a black box",
		],
		proof:
			"Proof: Clyde AI — a year of estimated work deployed in six weeks, embedded in the team.",
		pricing: "Scoped on the intake call.",
	},
] as const;

export type ServiceOffer = (typeof SERVICE_OFFERS)[number];
export type ServiceOfferId = ServiceOffer["id"];

export interface FitFinderState {
	selectedOfferId?: ServiceOfferId;
}

export interface OfferChoiceState {
	pressed: boolean;
	actionText: "See how →" | "Selected ✓";
	panelRevealed: boolean;
}

export function selectOffer(
	_state: FitFinderState,
	selectedOfferId: ServiceOfferId,
): FitFinderState {
	return { selectedOfferId };
}

export function getOfferChoiceState(
	state: FitFinderState,
	offerId: ServiceOfferId,
): OfferChoiceState {
	const isSelected = state.selectedOfferId === offerId;
	return {
		pressed: isSelected,
		actionText: isSelected ? "Selected ✓" : "See how →",
		panelRevealed: isSelected,
	};
}

export function getServiceOffer(id: ServiceOfferId): ServiceOffer {
	const offer = SERVICE_OFFERS.find((candidate) => candidate.id === id);
	if (!offer) throw new Error(`Unknown service offer: ${id}`);
	return offer;
}

export function buildServiceBookingUrl(offerId?: ServiceOfferId): string {
	if (!offerId) return BOOKING_URL;

	const url = new URL(BOOKING_URL);
	url.searchParams.set(
		"notes",
		`Interested in: ${getServiceOffer(offerId).name}`,
	);
	return url.toString();
}
