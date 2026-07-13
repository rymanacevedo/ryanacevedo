export interface FeaturedWorkEntry {
	data: {
		featured?: number;
	};
}

type RankedFeaturedWorkEntry<T extends FeaturedWorkEntry> = T & {
	data: T["data"] & { featured: number };
};

function hasFeaturedRank<T extends FeaturedWorkEntry>(
	entry: T,
): entry is RankedFeaturedWorkEntry<T> {
	return typeof entry.data.featured === "number";
}

export function selectFeaturedWork<T extends FeaturedWorkEntry>(
	entries: readonly T[],
): T[] {
	return entries.filter(hasFeaturedRank).sort((a, b) => {
		return a.data.featured - b.data.featured;
	});
}
