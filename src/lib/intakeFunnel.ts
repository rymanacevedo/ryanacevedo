export const BOOKING_URL = "https://cal.com/avocadotechgroup/discovery-call";

export interface IntakeFunnelState {
	email: string;
}

export function buildBookingUrl({ email }: IntakeFunnelState): string {
	const bookingUrl = new URL(BOOKING_URL);
	bookingUrl.searchParams.set("email", email);

	return bookingUrl.toString();
}
