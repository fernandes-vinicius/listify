import { type FormEvent, useState } from "react";
import type { ItemStatus } from "~/domains/shopping-list-items/types/item-types";
import { CurrencyInput } from "~/shared/components/currency-input";
import { Check, Home, Plus, Trash2 } from "~/shared/components/icons";
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
import { cn, formatCurrency } from "~/shared/lib/utils";

function parseNumber(raw: string): number {
	return Number(raw.replace(",", ".")) || 0;
}

export interface ItemFormValues {
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
	initialValues?: ItemFormValues;
	onSubmit: (values: ItemFormValues) => void;
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
	initialValues,
	onSubmit,
	onDelete,
}: ItemFormDrawerProps) {
	const [name, setName] = useState(initialValues?.name ?? "");
	const [quantity, setQuantity] = useState(
		String(initialValues?.quantity ?? 1),
	);
	const [unit, setUnit] = useState(initialValues?.unit ?? "");
	const [price, setPrice] = useState(initialValues?.price ?? 0);
	const [status, setStatus] = useState<ItemStatus>(
		initialValues?.status ?? "unchecked",
	);

	const quantityNumber = parseNumber(quantity);
	const total = quantityNumber * price;
	const canSubmit = name.trim().length > 0 && quantityNumber > 0;

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!canSubmit) return;

		onSubmit({
			name: name.trim(),
			quantity: quantityNumber,
			unit: unit.trim(),
			price,
			status,
		});

		if (mode === "edit") {
			onOpenChange(false);
		} else {
			// reset form state
			setName("");
			setQuantity("");
			setUnit("");
			setPrice(0);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				className="mx-auto flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-xl"
			>
				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
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

					<div className="flex flex-col gap-4 overflow-y-auto p-4">
						<div className="space-y-1.5">
							<Label htmlFor="item-name">Nome</Label>
							<Input
								id="item-name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="Ex: Leite"
								autoCapitalize="none"
								autoCorrect="off"
								spellCheck={false}
								// autoFocus
							/>
						</div>

						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="item-quantity">Quantidade</Label>
								<Input
									id="item-quantity"
									inputMode="decimal"
									value={quantity}
									onChange={(event) => setQuantity(event.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="item-unit">Unidade</Label>
								<Input
									id="item-unit"
									value={unit}
									onChange={(event) => setUnit(event.target.value)}
									placeholder="kg, un, L"
									autoCapitalize="none"
									autoCorrect="off"
									spellCheck={false}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="item-price">Preço unitário</Label>
								<CurrencyInput
									id="item-price"
									value={price}
									onValueChange={setPrice}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label>Total</Label>
							<div className="rounded-md border bg-muted px-3 py-2 font-bold text-sm">
								{formatCurrency(total)}
							</div>
						</div>

						{mode === "edit" && (
							<div className="space-y-2">
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
							</div>
						)}
					</div>

					<SheetFooter className="flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
						{mode === "edit" && onDelete ? (
							<Button
								type="button"
								variant="outline"
								className="w-full text-destructive sm:w-auto"
								onClick={onDelete}
							>
								<Trash2 className="size-3.5" />
								Excluir
							</Button>
						) : (
							<span className="hidden sm:inline" />
						)}
						<Button
							type="submit"
							disabled={!canSubmit}
							className={mode === "add" ? "w-full" : "w-full sm:w-auto"}
						>
							{mode === "add" ? (
								<>
									<Plus className="size-4" />
									Adicionar item
								</>
							) : (
								"Salvar alterações"
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
