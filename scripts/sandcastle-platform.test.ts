import { describe, expect, it } from "bun:test";

import { resolveSandboxUser } from "../.sandcastle/platform";

describe("resolveSandboxUser", () => {
	it("uses the current host identity on macOS", () => {
		expect(
			resolveSandboxUser(
				"darwin",
				() => 501,
				() => 20,
			),
		).toEqual({
			uid: 501,
			gid: 20,
		});
	});

	it("keeps the dedicated runner identity on Linux", () => {
		expect(
			resolveSandboxUser(
				"linux",
				() => 1001,
				() => 1002,
			),
		).toEqual({
			uid: 1001,
			gid: 1002,
		});
	});

	it("allows explicit identity overrides on either platform", () => {
		expect(
			resolveSandboxUser(
				"darwin",
				() => 501,
				() => 20,
				{
					SANDCASTLE_CONTAINER_UID: "700",
					SANDCASTLE_CONTAINER_GID: "701",
				},
			),
		).toEqual({ uid: 700, gid: 701 });
	});
});
