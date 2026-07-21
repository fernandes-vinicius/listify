import { track } from "@vercel/analytics";
import { useState } from "react";
import { toast } from "sonner";
import {
	detectPriceFromImage,
	MissingApiKeyError,
	RateLimitError,
} from "~/domains/shopping-list-items/utils/gemini-price-scanner";
import {
	loadImageFromFile,
	resizeImageToBase64,
} from "~/domains/shopping-list-items/utils/price-scan-image";
import { formatCurrency } from "~/shared/lib/utils";

export type PriceScanStatus = "idle" | "processing" | "success" | "error";

export function usePriceScanner(onPriceDetected: (price: number) => void) {
	const [status, setStatus] = useState<PriceScanStatus>("idle");

	async function scanFile(file: File) {
		setStatus("processing");
		try {
			const img = await loadImageFromFile(file);
			const { base64, mimeType } = resizeImageToBase64(img);
			const price = await detectPriceFromImage(base64, mimeType);

			if (price == null) {
				setStatus("error");
				track("price_scan", { result: "not_detected" });
				toast.error("Não consegui ler o preço na foto", {
					description: "Tente tirar a foto mais de perto, com boa luz.",
				});
				return;
			}

			onPriceDetected(price);
			setStatus("success");
			track("price_scan", { result: "success" });
			toast.success(`Preço identificado: ${formatCurrency(price)}`);
		} catch (error) {
			setStatus("error");
			if (error instanceof MissingApiKeyError) {
				track("price_scan", { result: "missing_api_key" });
				toast.error("Leitor de preço não configurado", {
					description:
						"Defina GEMINI_API_KEY no servidor pra usar esse recurso.",
				});
			} else if (error instanceof RateLimitError) {
				track("price_scan", { result: "rate_limited" });
				toast.error("Limite de uso da IA atingido", {
					description: "Tente novamente em alguns instantes.",
				});
			} else {
				track("price_scan", { result: "error" });
				toast.error("Não foi possível ler a foto");
			}
		} finally {
			// Deixa o ícone de sucesso/erro piscar brevemente antes de voltar ao
			// estado padrão (câmera).
			setTimeout(() => setStatus("idle"), 1500);
		}
	}

	return { scanFile, status };
}
