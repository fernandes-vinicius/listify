const STORAGE_KEY = "listify:data";

export function readStorage<T>(fallback: T): T {
	if (typeof window === "undefined") return fallback;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return fallback;

		const parsed = JSON.parse(raw);
		return hasSameArrayShape(parsed, fallback) ? (parsed as T) : fallback;
	} catch {
		return fallback;
	}
}

// Guarda estrutural rasa: confere que os campos que são array no `fallback`
// também são array no valor lido, evitando que um localStorage corrompido ou
// adulterado manualmente (ex.: via DevTools) quebre o app mais adiante com um
// formato inesperado (ex.: `storage.lists.find` num valor sem `lists`).
function hasSameArrayShape(value: unknown, fallback: unknown): boolean {
	if (typeof fallback !== "object" || fallback === null) return true;
	if (typeof value !== "object" || value === null) return false;

	return Object.entries(fallback).every(([key, fallbackValue]) => {
		if (!Array.isArray(fallbackValue)) return true;
		return Array.isArray((value as Record<string, unknown>)[key]);
	});
}

export function writeStorage<T>(data: T): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
