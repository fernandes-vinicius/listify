import { ipAddress } from "@vercel/functions";

// Vercel Serverless Function (convenção "framework=other": qualquer arquivo
// em /api vira uma function, independente do build da SPA em app/ que
// continua com `ssr: false`). Mantém a chave do Gemini fora do bundle do
// cliente — só o servidor lê `process.env.GEMINI_API_KEY`.
//
// gemini-3.1-flash-lite: modelo mais barato/rápido do Gemini com suporte a
// imagem, dentro do tier gratuito do Google AI Studio — suficiente pra ler
// um preço numa etiqueta de mercado.
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Defesa em profundidade contra a IA "alucinar" um valor absurdo — o preço
// final ainda passa pela validação normal do Zod no submit do form, mas não
// faz sentido nem tentar preencher um valor implausível.
const MIN_PRICE = 0;
const MAX_PRICE = 10000;

// A GEMINI_API_KEY é única e compartilhada por todos os visitantes do app —
// sem esse limite, um único IP martelando o endpoint consegue sozinho
// estourar a cota gratuita do Gemini pra todo mundo. Contador em memória
// (sem infra extra): a Fluid Compute reutiliza a mesma instância entre
// requisições concorrentes, então isso já barra a maior parte do abuso vindo
// de um único IP, mesmo não sendo um limite globalmente distribuído entre
// regiões/instâncias.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();

	for (const [key, entry] of requestsByIp) {
		if (now > entry.resetAt) requestsByIp.delete(key);
	}

	const entry = requestsByIp.get(ip);
	if (!entry) {
		requestsByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}

	entry.count += 1;
	return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

const PROMPT = `Esta foto foi tirada dentro de um supermercado brasileiro, geralmente mostrando a etiqueta de preço de uma prateleira ou a embalagem de um produto.

Identifique o preço unitário do produto, em reais.

Responda apenas com o valor numérico do preço, usando ponto como separador decimal (ex.: 12.9 para R$ 12,90). Se não houver um preço legível na imagem ou você não tiver confiança na leitura, responda com null.`;

function isPlausiblePrice(value: unknown): value is number {
	return (
		typeof value === "number" &&
		Number.isFinite(value) &&
		value > MIN_PRICE &&
		value < MAX_PRICE
	);
}

export async function POST(request: Request) {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		return Response.json({ error: "missing_api_key" }, { status: 500 });
	}

	const ip = ipAddress(request) ?? "unknown";
	if (isRateLimited(ip)) {
		return Response.json({ error: "rate_limited" }, { status: 429 });
	}

	const body = await request.json().catch(() => null);
	if (typeof body?.base64 !== "string" || typeof body?.mimeType !== "string") {
		return Response.json({ error: "invalid_body" }, { status: 400 });
	}
	const { base64, mimeType } = body;

	const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
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

	if (geminiResponse.status === 429) {
		return Response.json({ error: "rate_limited" }, { status: 429 });
	}
	if (!geminiResponse.ok) {
		// Erro do Gemini costuma vir com uma mensagem explicando exatamente o
		// que deu errado (ex.: campo inválido no request) — propagar em vez de
		// engolir facilita muito diagnosticar se o shape da API mudar.
		const detail = await geminiResponse.text().catch(() => "");
		return Response.json({ error: "gemini_error", detail }, { status: 502 });
	}

	const data = await geminiResponse.json();
	const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
	if (typeof text !== "string") {
		return Response.json({ price: null });
	}

	const parsed = JSON.parse(text);
	const price = isPlausiblePrice(parsed?.price) ? parsed.price : null;
	return Response.json({ price });
}
