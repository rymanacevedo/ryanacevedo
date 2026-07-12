import {
	buildBookingUrl,
	parseIntakeFormData,
} from "../../src/lib/intakeFunnel";

export default async function projectIntake(
	request: Request,
): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	const formData = await request.formData();
	const payload = new URLSearchParams();
	for (const [name, value] of formData) {
		if (typeof value === "string") payload.append(name, value);
	}

	const captureResponse = await fetch(new URL("/", request.url), {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: payload,
	});
	if (!captureResponse.ok) {
		return new Response("Unable to capture project intake", { status: 502 });
	}

	return Response.redirect(buildBookingUrl(parseIntakeFormData(formData)), 303);
}
