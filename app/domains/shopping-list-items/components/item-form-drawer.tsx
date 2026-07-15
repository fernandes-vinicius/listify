import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

// import { PriceScanButton } from "~/domains/shopping-list-items/components/price-scan-button";
import { itemFormSchema } from "~/domains/shopping-list-items/schemas/item-schema";
import type { ItemStatus } from "~/domains/shopping-list-items/types/item-types";
import { CurrencyInput } from "~/shared/components/currency-input";
import { Check, Home, Plus } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/shared/components/ui/field";
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
import { cn, formatCurrency } from "~/shared/lib/utils";

function parseNumber(raw: string): number {
	return Number(raw.replace(",", ".")) || 0;
}

export interface ItemFormInitialValues {
	name: string;
	quantity: number;
	unit: string;
	price: number;
	status: ItemStatus;
}

interface ItemFormDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "add" | "edit";
	listName: string;
	itemId?: string;
	initialValues?: ItemFormInitialValues;
	onDelete?: () => void;
}

const STATUS_OPTIONS: { status: ItemStatus; label: string }[] = [
	{ status: "unchecked", label: "Pendente" },
	{ status: "checked", label: "Comprado" },
	{ status: "have_at_home", label: "Tenho em casa" },
];

export function ItemFormDrawer({
	open,
	onOpenChange,
	mode,
	listName,
	itemId,
	initialValues,
	onDelete,
}: ItemFormDrawerProps) {
	const fetcher = useFetcher();
	const nameInputRef = useRef<HTMLInputElement>(null);

	const [form, fields] = useForm({
		lastResult: fetcher.data,
		shouldRevalidate: "onBlur",
		defaultValue: {
			name: initialValues?.name ?? "",
			quantity: String(initialValues?.quantity ?? 1),
			unit: initialValues?.unit ?? "",
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: itemFormSchema });
		},
	});

	// Preço e status são widgets customizados (máscara monetária, seletor de
	// pílulas) — geridos como estado React simples em vez de via Conform's
	// `useInputControl`. O `useInputControl` depende de localizar o `<form>`
	// no DOM para sincronizar o valor num input hidden gerenciado por ele;
	// nesse app (Sheet sempre montado mas fechado, `fetcher.Form` client-side)
	// essa sincronização se mostrou não confiável e chegou a submeter preço
	// zerado mesmo com o valor certo digitado. Estado local + input hidden
	// controlado por nós evita essa dependência frágil.
	const [quantityRaw, setQuantityRaw] = useState(
		String(initialValues?.quantity ?? 1),
	);
	const [price, setPrice] = useState(initialValues?.price ?? 0);
	const [status, setStatus] = useState<ItemStatus>(
		initialValues?.status ?? "unchecked",
	);
	const submitting = fetcher.state !== "idle";

	const total = parseNumber(quantityRaw) * price;

	// "Adicionar" permanece aberto pra permitir cadastrar vários itens em
	// sequência — os campos geridos pelo Conform resetam sozinhos (via
	// `resetForm` no clientAction), então só precisamos resetar os campos de
	// estado local aqui, e devolver o foco pro campo Nome (pronto pro próximo
	// item). "Editar" fecha o Sheet ao ver um `lastResult` de sucesso — sem
	// mudança de foco, já que o Sheet nem fica visível depois.
	//
	// `submission.reply({ resetForm: true })` (usado no "adicionar") retorna
	// `{ initialValue: null }` sem nenhum campo `status` — só o reply comum de
	// erro tem `error` preenchido — então "sem erro" é o sinal de sucesso, não
	// `status === "success"`.
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (!fetcher.data || fetcher.data.error) return;

		if (mode === "edit") {
			onOpenChange(false);
		} else {
			setQuantityRaw("1");
			setPrice(0);
			nameInputRef.current?.focus();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				// Não foca nenhum campo automaticamente ao abrir (em vez do padrão do
				// Dialog de focar o primeiro elemento focável) — o foco no Nome após
				// salvar (modo "adicionar") é tratado à parte, no efeito acima.
				initialFocus={false}
				className="mx-auto flex min-h-[96%] w-full max-w-xl flex-col rounded-t-xl sm:min-h-auto"
			>
				<fetcher.Form
					method="post"
					{...getFormProps(form)}
					autoComplete="off"
					className="flex min-h-0 flex-1 flex-col"
				>
					<input
						type="hidden"
						name="intent"
						value={mode === "add" ? "add-item" : "edit-item"}
					/>
					{mode === "edit" && (
						<input type="hidden" name="itemId" value={itemId} />
					)}
					<input type="hidden" name="status" value={status} readOnly />

					<SheetHeader className="p-4 text-center">
						<SheetTitle>
							{mode === "add" ? "Adicionar item" : "Editar item"}
						</SheetTitle>
						<SheetDescription>
							{mode === "add"
								? `Novo item em "${listName}"`
								: `"${initialValues?.name}" em "${listName}"`}
						</SheetDescription>
					</SheetHeader>

					<FieldGroup className="overflow-y-auto p-4">
						<Field>
							<FieldLabel htmlFor={fields.name.id}>Nome</FieldLabel>
							<Input
								ref={nameInputRef}
								{...getInputProps(fields.name, { type: "text" })}
								placeholder="Ex: leite"
								autoCapitalize="none"
								autoCorrect="off"
								spellCheck={false}
							/>
							<FieldError>{fields.name.errors?.[0]}</FieldError>
						</Field>

						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							<Field>
								<FieldLabel htmlFor={fields.quantity.id}>Quantidade</FieldLabel>
								<Input
									{...getInputProps(fields.quantity, { type: "text" })}
									inputMode="decimal"
									onChange={(event) => setQuantityRaw(event.target.value)}
								/>
								<FieldError>{fields.quantity.errors?.[0]}</FieldError>
							</Field>
							<Field>
								<FieldLabel htmlFor={fields.unit.id}>Unidade</FieldLabel>
								<Input
									{...getInputProps(fields.unit, { type: "text" })}
									placeholder="kg, un, L"
									autoCapitalize="none"
									autoCorrect="off"
									spellCheck={false}
								/>
								<FieldError>{fields.unit.errors?.[0]}</FieldError>
							</Field>
							<Field>
								<FieldLabel htmlFor="item-price">Preço unitário</FieldLabel>
								<input type="hidden" name="price" value={price} readOnly />
								<div className="flex gap-1.5">
									<CurrencyInput
										id="item-price"
										value={price}
										onValueChange={setPrice}
										className="min-w-0 flex-1"
									/>
									{/* {mode === "edit" && (
										<PriceScanButton onPriceDetected={setPrice} />
									)} */}
								</div>
								<FieldError>{fields.price.errors?.[0]}</FieldError>
							</Field>
						</div>

						{/* <FieldSeparator>Status</FieldSeparator> */}

						{mode === "edit" && (
							<Field>
								<Label>Status</Label>
								<div className="grid grid-cols-3 gap-2">
									{STATUS_OPTIONS.map((option) => {
										const isSelected = status === option.status;
										return (
											<button
												key={option.status}
												type="button"
												onClick={() => setStatus(option.status)}
												className={cn(
													"flex flex-col items-center gap-1.5 rounded-md border-[1.5px] px-2 py-2.5 text-center transition-colors",
													!isSelected && "border-border",
													isSelected &&
														option.status === "unchecked" &&
														"border-muted-foreground/40 bg-muted",
													isSelected &&
														option.status === "checked" &&
														"border-green-600 bg-green-50 dark:bg-green-500/10",
													isSelected &&
														option.status === "have_at_home" &&
														"border-amber-500 bg-amber-50 dark:bg-amber-500/10",
												)}
											>
												<span
													className={cn(
														"flex size-5 items-center justify-center rounded-full border-[1.5px]",
														option.status === "unchecked" &&
															"border-muted-foreground/30",
														option.status === "checked" &&
															"border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500",
														option.status === "have_at_home" &&
															"border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
													)}
												>
													{option.status === "checked" && (
														<Check className="size-3" strokeWidth={3} />
													)}
													{option.status === "have_at_home" && (
														<Home className="size-3" strokeWidth={2.4} />
													)}
												</span>
												<span
													className={cn(
														"font-semibold text-[11px]",
														!isSelected && "text-muted-foreground",
														isSelected &&
															option.status === "unchecked" &&
															"text-foreground",
														isSelected &&
															option.status === "checked" &&
															"text-green-700 dark:text-green-400",
														isSelected &&
															option.status === "have_at_home" &&
															"text-amber-700 dark:text-amber-400",
													)}
												>
													{option.label}
												</span>
											</button>
										);
									})}
								</div>
							</Field>
						)}

						<Field
							orientation="horizontal"
							className="border-t border-dashed pt-5"
						>
							<Label className="flex-1 text-muted-foreground">Total</Label>
							<div className="font-medium text-sm">{formatCurrency(total)}</div>
						</Field>
					</FieldGroup>

					<SheetFooter className="flex-col-reverse gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
						{mode === "edit" && onDelete ? (
							<Button
								type="button"
								variant="destructive"
								className="w-full sm:w-auto"
								onClick={onDelete}
							>
								{/* <Trash2 /> */}
								Excluir
							</Button>
						) : (
							<span className="hidden sm:inline" />
						)}
						<Button
							type="submit"
							disabled={submitting}
							className={mode === "add" ? "w-full" : "w-full sm:w-auto"}
						>
							{mode === "add" ? (
								<>
									<Plus />
									{submitting ? "Adicionando…" : "Adicionar item"}
								</>
							) : submitting ? (
								"Salvando…"
							) : (
								"Salvar alterações"
							)}
						</Button>
					</SheetFooter>
				</fetcher.Form>
			</SheetContent>
		</Sheet>
	);
}
