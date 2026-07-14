import { useState } from "react";
import { toast } from "sonner";
import {
	loadImageFromFile,
	preprocessForOcr,
} from "~/domains/shopping-list-items/utils/price-ocr-image";
import { extractPriceFromOcrText } from "~/domains/shopping-list-items/utils/price-ocr-parse";
import { recognizePriceFromImage } from "~/domains/shopping-list-items/utils/price-ocr-worker";
import { formatCurrency } from "~/shared/lib/utils";

export type PriceScanStatus = "idle" | "processing" | "success" | "error";

export function usePriceScanner(onPriceDetected: (price: number) => void) {
	const [status, setStatus] = useState<PriceScanStatus>("idle");

	async function scanFile(file: File) {
		setStatus("processing");
		try {
			const img = await loadImageFromFile(file);
			const canvas = preprocessForOcr(img);
			const text = await recognizePriceFromImage(canvas);
			const price = extractPriceFromOcrText(text);

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
		} catch {
			setStatus("error");
			toast.error("Não foi possível ler a foto");
		} finally {
			// Deixa o ícone de sucesso/erro piscar brevemente antes de voltar ao
			// estado padrão (câmera).
			setTimeout(() => setStatus("idle"), 1500);
		}
	}

	return { scanFile, status };
}
