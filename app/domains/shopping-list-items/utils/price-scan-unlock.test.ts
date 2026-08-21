import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	isPriceScanUnlocked,
	markPriceScanUnlocked,
	verifyPriceScanCode,
} from "./price-scan-unlock";

describe("isPriceScanUnlocked / markPriceScanUnlocked", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	it("começa destravado como false", () => {
		expect(isPriceScanUnlocked()).toBe(false);
	});

	it("fica true depois de markPriceScanUnlocked", () => {
		markPriceScanUnlocked();
		expect(isPriceScanUnlocked()).toBe(true);
	});

	it("persiste entre chamadas (mesma chave do localStorage)", () => {
		markPriceScanUnlocked();
		expect(window.localStorage.getItem("listify:price-scan-unlocked")).toBe(
			"true",
		);
	});

	it("não quebra se o localStorage lançar (ex.: modo privado)", () => {
		const getItemSpy = vi
			.spyOn(window.localStorage.__proto__, "getItem")
			.mockImplementation(() => {
				throw new Error("localStorage indisponível");
			});

		expect(isPriceScanUnlocked()).toBe(false);

		getItemSpy.mockRestore();
	});
});

describe("verifyPriceScanCode", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("retorna valid:true quando a API responde valid:true", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ valid: true }), { status: 200 }),
				),
		);

		const result = await verifyPriceScanCode("2357");

		expect(result).toEqual({ valid: true });
		expect(fetch).toHaveBeenCalledWith(
			"/api/verify-price-scan-code",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ code: "2357" }),
			}),
		);
	});

	it("retorna valid:false quando a API responde valid:false", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ valid: false }), { status: 200 }),
				),
		);

		await expect(verifyPriceScanCode("0000")).resolves.toEqual({
			valid: false,
		});
	});

	it("mapeia 429 pra error:rate_limited", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response(null, { status: 429 })),
		);

		await expect(verifyPriceScanCode("2357")).resolves.toEqual({
			valid: false,
			error: "rate_limited",
		});
	});

	it("mapeia outras respostas não-ok pra error:server_error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
		);

		await expect(verifyPriceScanCode("2357")).resolves.toEqual({
			valid: false,
			error: "server_error",
		});
	});
});
