export const BOOKING_URL = "https://cal.com/avocadotechgroup/discovery-call";
export const FORM_NAME = "project-intake";

export interface IntakeFunnelState {
	email: string;
	stage?: string;
	timeframe?: string;
	start?: string;
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
