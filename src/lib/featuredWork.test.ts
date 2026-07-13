import { describe, expect, test } from "bun:test";
import { selectFeaturedWork } from "./featuredWork";

describe("featured work selector", () => {
	test("returns ranked entries in ascending lineup order and excludes unranked entries", () => {
		const entries = [
			{ data: { title: "Second Chance Center", featured: 2 } },
			{ data: { title: "Employment project" } },
			{ data: { title: "Clyde AI", featured: 1 } },
		];

		expect(
			selectFeaturedWork(entries).map((entry) => entry.data.title),
		).toEqual(["Clyde AI", "Second Chance Center"]);
	});

	test("returns no entries for an empty collection", () => {
		expect(selectFeaturedWork([])).toEqual([]);
	});

	test("excludes entries with an invalid numeric rank", () => {
		const entries = [
			{ data: { title: "Clyde AI", featured: 1 } },
			{ data: { title: "Invalid rank", featured: Number.NaN } },
		];

		expect(
			selectFeaturedWork(entries).map((entry) => entry.data.title),
		).toEqual(["Clyde AI"]);
	});
});
