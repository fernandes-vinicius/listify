// gemini-3.1-flash-lite: modelo mais barato/rápido do Gemini com suporte a
// imagem, dentro do tier gratuito do Google AI Studio — suficiente pra ler
// um preço numa etiqueta de mercado. Ver plano em
// ~/.claude/plans/transient-skipping-tulip.md pro racional da escolha.
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Defesa em profundidade contra a IA "alucinar" um valor absurdo — o preço
// final ainda passa pela validação normal do Zod no submit do form, mas não
// faz sentido nem tentar preencher um valor implausível.
const MIN_PRICE = 0;
const MAX_PRICE = 10000;

const PROMPT = `Esta foto foi tirada dentro de um supermercado brasileiro, geralmente mostrando a etiqueta de preço de uma prateleira ou a embalagem de um produto.

Identifique o preço unitário do produto, em reais.

Responda apenas com o valor numérico do preço, usando ponto como separador decimal (ex.: 12.9 para R$ 12,90). Se não houver um preço legível na imagem ou você não tiver confiança na leitura, responda com null.`;

export class MissingApiKeyError extends Error {
	constructor() {
		super("VITE_GEMINI_API_KEY não configurada");
		this.name = "MissingApiKeyError";
	}
}

export class RateLimitError extends Error {
	constructor() {
		super("Limite de uso gratuito da IA atingido");
		this.name = "RateLimitError";
	}
}

function isPlausiblePrice(value: unknown): value is number {
	return (
		typeof value === "number" &&
		Number.isFinite(value) &&
		value > MIN_PRICE &&
		value < MAX_PRICE
	);
}

export async function detectPriceFromImage(
	base64: string,
	mimeType: string,
): Promise<number | null> {
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
	if (!apiKey) throw new MissingApiKeyError();

	const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [
				{
					parts: [{ text: PROMPT }, { inlineData: { mimeType, data: base64 } }],
				},
			],
			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: {
					type: "OBJECT",
					properties: { price: { type: "NUMBER", nullable: true } },
					required: ["price"],
				},
			},
		}),
	});

	if (response.status === 429) throw new RateLimitError();
	if (!response.ok) {
		// Erro do Gemini costuma vir com uma mensagem explicando exatamente o
		// que deu errado (ex.: campo inválido no request) — propagar em vez de
		// engolir facilita muito diagnosticar se o shape da API mudar.
		const body = await response.text().catch(() => "");
		throw new Error(`Gemini respondeu ${response.status}: ${body}`);
	}

	const data = await response.json();
	const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
	if (typeof text !== "string") return null;

	const parsed = JSON.parse(text);
	return isPlausiblePrice(parsed?.price) ? parsed.price : null;
}
