export const BOOKING_URL = "https://cal.com/avocadotechgroup/discovery-call";
export const FORM_NAME = "project-intake";

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
