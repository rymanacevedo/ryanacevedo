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

interface FormPayloadState {
	email: string;
	stage?: string;
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

// Opening a stage card must not yank the viewport away from the Problem/Answer
// the visitor just opened, so a newly revealed timeframe question never scrolls.
export function getRevealScrollTarget(
	newlyRevealed: readonly QuestionId[],
): QuestionId | undefined {
	return newlyRevealed.includes("start") ? "start" : undefined;
}

// A fully visible answer must not move the page; only a clipped card earns a scroll.
export function shouldScrollOpenedCard(
	cardTop: number,
	cardBottom: number,
	viewportHeight: number,
): boolean {
	return cardTop < 0 || cardBottom > viewportHeight;
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

function getLastNonEmptyString(formData: FormData, name: string): string {
	return (
		formData
			.getAll(name)
			.filter((value): value is string => typeof value === "string")
			.findLast((value) => value.length > 0) ?? ""
	);
}

export function parseIntakeFormData(formData: FormData): IntakeFunnelState {
	const stage = getLastNonEmptyString(formData, "stage");
	const timeframe = getLastNonEmptyString(formData, "timeframe");
	const start = getLastNonEmptyString(formData, "start");

	return {
		email: getLastNonEmptyString(formData, "email"),
		...(isStage(stage) ? { stage } : {}),
		...(timeframe ? { timeframe } : {}),
		...(start ? { start } : {}),
	};
}

export function buildFormPayload(
	{ email, stage = "", timeframe = "", start = "" }: FormPayloadState,
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
