export interface FeaturedWorkEntry {
	data: {
		featured?: number;
	};
}

function isFeaturedWork<T extends FeaturedWorkEntry>(
	entry: T,
): entry is T & { data: T["data"] & { featured: number } } {
	return typeof entry.data.featured === "number";
}

export function selectFeaturedWork<T extends FeaturedWorkEntry>(
	entries: readonly T[],
): T[] {
	return entries.filter(isFeaturedWork).sort((a, b) => {
		return a.data.featured - b.data.featured;
	});
}
