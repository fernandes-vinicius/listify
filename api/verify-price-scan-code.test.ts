import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./verify-price-scan-code";

// `ipAddress()` (@vercel/functions) lê o header `x-real-ip` — cada teste usa
// um IP diferente pra não disparar o rate limit (contador em memória,
// compartilhado entre chamadas dentro do módulo) de um teste no outro.
function makeRequest(body: unknown, ip: string): Request {
	return new Request("http://localhost/api/verify-price-scan-code", {
		method: "POST",
		headers: { "content-type": "application/json", "x-real-ip": ip },
		body: JSON.stringify(body),
	});
}

describe("POST /api/verify-price-scan-code", () => {
	beforeEach(() => {
		vi.stubEnv("PRICE_SCAN_UNLOCK_CODE", "2357");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("retorna valid:true quando o código bate", async () => {
		const response = await POST(makeRequest({ code: "2357" }, "1.1.1.1"));

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ valid: true });
	});

	it("retorna valid:false quando o código não bate", async () => {
		const response = await POST(makeRequest({ code: "0000" }, "1.1.1.2"));

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ valid: false });
	});

	it("rejeita corpo sem `code` string", async () => {
		const response = await POST(makeRequest({ code: 2357 }, "1.1.1.3"));

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({ error: "invalid_body" });
	});

	it("rejeita JSON inválido no corpo", async () => {
		const request = new Request("http://localhost/api/verify-price-scan-code", {
			method: "POST",
			headers: { "content-type": "application/json", "x-real-ip": "1.1.1.4" },
			body: "não é json",
		});

		const response = await POST(request);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({ error: "invalid_body" });
	});

	it("responde 500 quando PRICE_SCAN_UNLOCK_CODE não está configurada", async () => {
		vi.stubEnv("PRICE_SCAN_UNLOCK_CODE", "");

		const response = await POST(makeRequest({ code: "2357" }, "1.1.1.5"));

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({
			error: "missing_unlock_code",
		});
	});

	it("bloqueia com 429 depois de 5 tentativas no mesmo IP na janela", async () => {
		const ip = "2.2.2.2";

		for (let attempt = 1; attempt <= 5; attempt++) {
			const response = await POST(makeRequest({ code: "0000" }, ip));
			expect(response.status).toBe(200);
		}

		const sixth = await POST(makeRequest({ code: "0000" }, ip));
		expect(sixth.status).toBe(429);
		await expect(sixth.json()).resolves.toEqual({ error: "rate_limited" });

		// Mesmo o código certo é barrado enquanto a janela de rate limit não
		// expira — o limite é por IP, não por tentativa de acerto.
		const seventh = await POST(makeRequest({ code: "2357" }, ip));
		expect(seventh.status).toBe(429);
	});

	it("não conta tentativas de um IP diferente no mesmo limite", async () => {
		for (let attempt = 1; attempt <= 5; attempt++) {
			await POST(makeRequest({ code: "0000" }, "3.3.3.3"));
		}

		const response = await POST(makeRequest({ code: "2357" }, "3.3.3.4"));
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ valid: true });
	});
});
