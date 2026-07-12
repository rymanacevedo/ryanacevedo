export const BOOKING_URL = "https://cal.com/avocadotechgroup/discovery-call";

export interface IntakeFunnelState {
	email: string;
	stage?: string;
	timeframe?: string;
	start?: string;
}

export function buildBookingUrl({ email }: IntakeFunnelState): string {
	const bookingUrl = new URL(BOOKING_URL);
	bookingUrl.searchParams.set("email", email);

	return bookingUrl.toString();
}

export function buildFormPayload(
	{ email, stage = "", timeframe = "", start = "" }: IntakeFunnelState,
	botField = "",
): string {
	return new URLSearchParams({
		"form-name": "project-intake",
		email,
		stage,
		timeframe,
		start,
		"bot-field": botField,
	}).toString();
}
