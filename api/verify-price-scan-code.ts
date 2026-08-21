import { ipAddress } from "@vercel/functions";

// Vercel Serverless Function (mesma convenção de api/scan-price.ts) — o
// código de desbloqueio só é comparado aqui, server-side, e nunca chega ao
// bundle do cliente.

// 5 tentativas por minuto por IP: baixo o bastante pra tornar inviável
// forçar as 10.000 combinações de um PIN de 4 dígitos (levaria dezenas de
// horas), sem travar quem só errou a digitação uma ou duas vezes.
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

export async function POST(request: Request) {
	const unlockCode = process.env.PRICE_SCAN_UNLOCK_CODE;
	if (!unlockCode) {
		return Response.json({ error: "missing_unlock_code" }, { status: 500 });
	}

	const ip = ipAddress(request) ?? "unknown";
	if (isRateLimited(ip)) {
		return Response.json({ error: "rate_limited" }, { status: 429 });
	}

	const body = await request.json().catch(() => null);
	if (typeof body?.code !== "string") {
		return Response.json({ error: "invalid_body" }, { status: 400 });
	}

	return Response.json({ valid: body.code === unlockCode });
}
