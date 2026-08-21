import { useState } from "react";

import {
	markPriceScanUnlocked,
	verifyPriceScanCode,
} from "~/domains/shopping-list-items/utils/price-scan-unlock";
import { Lock } from "~/shared/components/icons";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "~/shared/components/ui/alert-dialog";
import { Field, FieldError } from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";

interface PriceScanUnlockDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUnlocked: () => void;
}

export function PriceScanUnlockDialog({
	open,
	onOpenChange,
	onUnlocked,
}: PriceScanUnlockDialogProps) {
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [verifying, setVerifying] = useState(false);

	function reset() {
		setCode("");
		setError(null);
		setVerifying(false);
	}

	async function handleConfirm() {
		if (code.length !== 4) {
			setError("Digite os 4 dígitos do código");
			return;
		}

		setVerifying(true);
		setError(null);
		const result = await verifyPriceScanCode(code);
		setVerifying(false);

		if (result.valid) {
			markPriceScanUnlocked();
			reset();
			onOpenChange(false);
			onUnlocked();
			return;
		}

		if (result.error === "rate_limited") {
			setError("Muitas tentativas. Aguarde um pouco antes de tentar de novo.");
		} else if (result.error === "server_error") {
			setError("Não foi possível verificar o código agora.");
		} else {
			setError("Código incorreto");
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (!next) reset();
				onOpenChange(next);
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia>
						<Lock />
					</AlertDialogMedia>
					<AlertDialogTitle>Recurso restrito</AlertDialogTitle>
					<AlertDialogDescription>
						Digite o código de 4 dígitos pra usar o leitor de preço por foto.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<Field>
					<Input
						autoFocus
						inputMode="numeric"
						maxLength={4}
						placeholder="0000"
						className="text-center text-lg tracking-[0.5em]"
						value={code}
						onChange={(event) => {
							setCode(event.target.value.replace(/\D/g, "").slice(0, 4));
							setError(null);
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter") handleConfirm();
						}}
					/>
					<FieldError>{error}</FieldError>
				</Field>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction disabled={verifying} onClick={handleConfirm}>
						{verifying ? "Verificando…" : "Confirmar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
