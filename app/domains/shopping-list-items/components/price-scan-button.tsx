import { useRef } from "react";
import { usePriceScanner } from "~/domains/shopping-list-items/hooks/use-price-scanner";
import { Camera, Check, Loader2 } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

interface PriceScanButtonProps {
	onPriceDetected: (price: number) => void;
}

// Botão de câmera pro campo de preço: abre a câmera/galeria nativa, lê o
// preço da foto via OCR (ver use-price-scanner.ts) e chama `onPriceDetected`
// — o mesmo `setPrice` que o CurrencyInput já usa manualmente.
export function PriceScanButton({ onPriceDetected }: PriceScanButtonProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { scanFile, status } = usePriceScanner(onPriceDetected);

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				capture="environment"
				className="sr-only"
				onChange={(event) => {
					const file = event.target.files?.[0];
					// Permite selecionar o mesmo arquivo de novo numa próxima tentativa.
					event.target.value = "";
					if (file) scanFile(file);
				}}
			/>
			<Button
				type="button"
				variant="outline"
				size="icon"
				disabled={status === "processing"}
				aria-label="Ler preço com a câmera"
				onClick={() => inputRef.current?.click()}
			>
				{status === "processing" ? (
					<Loader2 className="animate-spin" />
				) : status === "success" ? (
					<Check />
				) : (
					<Camera />
				)}
			</Button>
		</>
	);
}
