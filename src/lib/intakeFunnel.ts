export const BOOKING_URL = "https://cal.com/avocadotechgroup/discovery-call";
export const FORM_NAME = "project-intake";
export const STAGES = [
	"Just starting",
	"Scaling",
	"Established business",
	"Enterprise",
] as const;

export type Stage = (typeof STAGES)[number];

export interface IntakeFunnelState {
	email: string;
	stage?: Stage;
	timeframe?: string;
	start?: string;
}

export type TestimonialId = "seed" | "scaling" | "established" | "enterprise";

export type QuestionId = "timeframe" | "start";

export function getRevealedQuestions(
	state: IntakeFunnelState,
	alreadyRevealed: readonly QuestionId[] = [],
): QuestionId[] {
	const revealed: QuestionId[] = [];
	if (state.stage || alreadyRevealed.includes("timeframe"))
		revealed.push("timeframe");
	if (state.timeframe || alreadyRevealed.includes("start"))
		revealed.push("start");
	return revealed;
}

const TESTIMONIAL_BY_STAGE: Record<Stage, TestimonialId> = {
	"Just starting": "seed",
	Scaling: "scaling",
	"Established business": "established",
	Enterprise: "enterprise",
};

export function getPromotedTestimonial(
	stage?: string,
): TestimonialId | undefined {
	return isStage(stage) ? TESTIMONIAL_BY_STAGE[stage] : undefined;
}

export function isStage(stage?: string): stage is Stage {
	return STAGES.includes(stage as Stage);
}

export function buildBrief({
	stage,
	timeframe,
	start,
}: IntakeFunnelState): string {
	return [
		stage ? `Stage: ${stage}` : "",
		timeframe ? `Timeframe: ${timeframe}` : "",
		start ? `Start: ${start}` : "",
	]
		.filter(Boolean)
		.join(" · ");
}

export function buildBookingUrl(state: IntakeFunnelState): string {
	const bookingUrl = new URL(BOOKING_URL);
	bookingUrl.searchParams.set("email", state.email);
	const brief = buildBrief(state);

	if (brief) {
		bookingUrl.searchParams.set("notes", brief);
	}

	return bookingUrl.toString();
}

export function buildFormPayload(
	{ email, stage = "", timeframe = "", start = "" }: IntakeFunnelState,
	{ botField = "" }: { botField?: string } = {},
): string {
	return new URLSearchParams({
		"form-name": FORM_NAME,
		email,
		stage,
		timeframe,
		start,
		"bot-field": botField,
	}).toString();
}
