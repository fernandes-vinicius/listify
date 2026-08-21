// Controla o acesso ao leitor de preço por foto (PriceScanButton) — a chave
// do Gemini é compartilhada por todo mundo que abrir o app, então até existir
// um sistema de contas, um código de 4 dígitos (PRICE_SCAN_UNLOCK_CODE, só
// lido server-side em api/verify-price-scan-code.ts) funciona como um "cupom"
// pra restringir o uso. Uma vez acertado, fica lembrado neste navegador — não
// precisa perguntar de novo.

const UNLOCKED_STORAGE_KEY = "listify:price-scan-unlocked";

export function isPriceScanUnlocked(): boolean {
	try {
		return window.localStorage.getItem(UNLOCKED_STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

export function markPriceScanUnlocked(): void {
	try {
		window.localStorage.setItem(UNLOCKED_STORAGE_KEY, "true");
	} catch {
		// localStorage indisponível (modo privado, quota etc.) — sem problema,
		// só volta a perguntar o código na próxima vez.
	}
}

export type VerifyPriceScanCodeResult =
	| { valid: true }
	| { valid: false; error?: "rate_limited" | "server_error" };

export async function verifyPriceScanCode(
	code: string,
): Promise<VerifyPriceScanCodeResult> {
	const response = await fetch("/api/verify-price-scan-code", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ code }),
	});

	if (response.status === 429) return { valid: false, error: "rate_limited" };
	if (!response.ok) return { valid: false, error: "server_error" };

	const data = await response.json().catch(() => null);
	return { valid: data?.valid === true };
}
