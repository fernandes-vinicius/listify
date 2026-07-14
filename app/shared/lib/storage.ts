const STORAGE_KEY = "listify:data";

export function readStorage<T>(fallback: T): T {
	if (typeof window === "undefined") return fallback;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

export function writeStorage<T>(data: T): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createId(): string {
	return crypto.randomUUID();
}
