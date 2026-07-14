import { type FormEvent, useState } from "react";
import { CurrencyInput } from "~/shared/components/currency-input";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

interface ListFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initialName?: string;
	initialBudget?: number | null;
	onSubmit: (name: string, budget: number | null) => void;
}

export function ListFormDialog({
	open,
	onOpenChange,
	mode,
	initialName,
	initialBudget,
	onSubmit,
}: ListFormDialogProps) {
	const [name, setName] = useState(initialName ?? "");
	const [budget, setBudget] = useState(initialBudget ?? 0);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;

		// R$ 0,00 é tratado como "sem orçamento definido" — o campo é opcional
		// e a máscara monetária sempre parte de zero, então não faz sentido
		// distinguir "zero" de "não preenchido" nesse contexto.
		onSubmit(trimmed, budget > 0 ? budget : null);
		onOpenChange(false);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				className="mx-auto flex min-h-[96%] w-full max-w-xl flex-col rounded-t-xl sm:min-h-auto"
			>
				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
					<SheetHeader className="p-4 text-center">
						<SheetTitle>
							{mode === "create" ? "Criar nova lista" : "Editar lista"}
						</SheetTitle>
						<SheetDescription>
							{mode === "create"
								? "Dê um nome para a sua nova lista de compras."
								: "Altere o nome ou o orçamento dessa lista."}
						</SheetDescription>
					</SheetHeader>

					<div className="flex flex-col gap-4 overflow-y-auto p-4">
						<div className="space-y-1.5">
							<Label htmlFor="list-name">Nome</Label>
							<Input
								id="list-name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="Ex: Feira do mês"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="list-budget">Orçamento (opcional)</Label>
							<CurrencyInput
								id="list-budget"
								value={budget}
								onValueChange={setBudget}
							/>
							<p className="text-muted-foreground text-xs">
								Valor máximo que você pretende gastar nessa lista. Deixe em R$
								0,00 para não definir um orçamento.
							</p>
						</div>
					</div>

					<SheetFooter className="border-t p-4">
						<Button type="submit" disabled={!name.trim()}>
							{mode === "create" ? "Criar lista" : "Salvar"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
