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
				toast.error("Não consegui ler o preço na foto", {
					description: "Tente tirar a foto mais de perto, com boa luz.",
				});
				return;
			}

			onPriceDetected(price);
			setStatus("success");
			toast.success(`Preço identificado: ${formatCurrency(price)}`);
		} catch (error) {
			setStatus("error");
			if (error instanceof MissingApiKeyError) {
				toast.error("Leitor de preço não configurado", {
					description:
						"Defina VITE_GEMINI_API_KEY no .env pra usar esse recurso.",
				});
			} else if (error instanceof RateLimitError) {
				toast.error("Limite de uso da IA atingido", {
					description: "Tente novamente em alguns instantes.",
				});
			} else {
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
