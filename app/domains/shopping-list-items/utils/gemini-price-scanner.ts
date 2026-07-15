// Chamada real ao Gemini roda server-side, na Vercel Function
// `api/scan-price.ts` — a chave nunca chega ao bundle do cliente. Este
// arquivo só repassa a foto e traduz a resposta em erros tipados.

export class MissingApiKeyError extends Error {
	constructor() {
		super("GEMINI_API_KEY não configurada no servidor");
		this.name = "MissingApiKeyError";
	}
}

export class RateLimitError extends Error {
	constructor() {
		super("Limite de uso gratuito da IA atingido");
		this.name = "RateLimitError";
	}
}

export async function detectPriceFromImage(
	base64: string,
	mimeType: string,
): Promise<number | null> {
	const response = await fetch("/api/scan-price", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ base64, mimeType }),
	});

	if (response.status === 429) throw new RateLimitError();

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		if (body?.error === "missing_api_key") throw new MissingApiKeyError();

		throw new Error(
			`Scanner de preço respondeu ${response.status}: ${body?.detail ?? ""}`,
		);
	}

	const data = await response.json();
	return typeof data?.price === "number" ? data.price : null;
}
