import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { shoppingListFormSchema } from "~/domains/shopping-lists/schemas/shopping-list-schema";
import { CurrencyInput } from "~/shared/components/currency-input";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
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
	listId?: string;
	initialName?: string;
	initialBudget?: number | null;
}

export function ListFormDialog({
	open,
	onOpenChange,
	mode,
	listId,
	initialName,
	initialBudget,
}: ListFormDialogProps) {
	const fetcher = useFetcher();

	const [form, fields] = useForm({
		lastResult: fetcher.data,
		shouldRevalidate: "onBlur",
		defaultValue: {
			name: initialName ?? "",
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: shoppingListFormSchema });
		},
	});

	// Orçamento é uma máscara monetária customizada — geridos como estado
	// React simples (não via Conform's `useInputControl`, que depende de
	// localizar o `<form>` no DOM pra sincronizar um input hidden e se mostrou
	// não confiável nesse app; ver item-form-drawer.tsx para o caso completo).
	const [budget, setBudget] = useState(initialBudget ?? 0);
	const submitting = fetcher.state !== "idle";

	// Rota de "criar" redireciona pra `/lists/:id` no sucesso (o fetcher segue o
	// redirect e a rota some, então o Sheet nem chega a permanecer montado). Já
	// "editar" não redireciona, então fechamos o Sheet manualmente ao ver um
	// `lastResult` de sucesso.
	useEffect(() => {
		if (mode === "edit" && fetcher.data && !fetcher.data.error) {
			onOpenChange(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				className="mx-auto flex min-h-[96%] w-full max-w-xl flex-col rounded-t-xl sm:min-h-auto"
			>
				<fetcher.Form
					method="post"
					{...getFormProps(form)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<input
						type="hidden"
						name="intent"
						value={mode === "create" ? "create-list" : "update-list"}
					/>
					{mode === "edit" && <input type="hidden" name="id" value={listId} />}

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

					<FieldGroup className="overflow-y-auto p-4">
						<Field>
							<FieldLabel htmlFor={fields.name.id}>Nome</FieldLabel>
							<Input
								{...getInputProps(fields.name, { type: "text" })}
								placeholder="Ex: Feira do mês"
								autoFocus
							/>
							<FieldError>{fields.name.errors?.[0]}</FieldError>
						</Field>

						<Field>
							<FieldLabel htmlFor="list-budget">
								Orçamento (opcional)
							</FieldLabel>
							<input type="hidden" name="budget" value={budget} readOnly />
							<CurrencyInput
								id="list-budget"
								value={budget}
								onValueChange={setBudget}
							/>
							<FieldError>{fields.budget.errors?.[0]}</FieldError>
							<FieldDescription>
								Valor máximo que você pretende gastar nessa lista. Deixe em R$
								0,00 para não definir um orçamento.
							</FieldDescription>
						</Field>
					</FieldGroup>

					<SheetFooter className="border-t p-4">
						<Button type="submit" disabled={submitting}>
							{submitting
								? "Salvando…"
								: mode === "create"
									? "Criar lista"
									: "Salvar"}
						</Button>
					</SheetFooter>
				</fetcher.Form>
			</SheetContent>
		</Sheet>
	);
}
