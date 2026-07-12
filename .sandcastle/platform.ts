type RunnerEnvironment = Record<string, string | undefined>;

function parseIdentity(value: string | undefined, fallback: number): number {
	if (value === undefined) return fallback;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isInteger(parsed) || parsed < 0) {
		throw new Error(`Invalid Sandcastle container identity: ${value}`);
	}
	return parsed;
}

export function resolveSandboxUser(
	platform: NodeJS.Platform,
	getUid: () => number,
	getGid: () => number,
	environment: RunnerEnvironment = process.env,
) {
	const hostIdentity = platform === "darwin";
	const defaultUid = hostIdentity ? getUid() : 1001;
	const defaultGid = hostIdentity ? getGid() : 1002;

	return {
		uid: parseIdentity(environment.SANDCASTLE_CONTAINER_UID, defaultUid),
		gid: parseIdentity(environment.SANDCASTLE_CONTAINER_GID, defaultGid),
	};
}
