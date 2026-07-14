import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import type { ItemFormInitialValues } from "~/domains/shopping-list-items/components/item-form-drawer";
import { CurrencyInput } from "~/shared/components/currency-input";
import { Button } from "~/shared/components/ui/button";
import { Field, FieldLabel } from "~/shared/components/ui/field";
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
import { formatCurrency } from "~/shared/lib/utils";

function parseNumber(raw: string): number {
	return Number(raw.replace(",", ".")) || 0;
}

interface ItemPriceEditDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listName: string;
	itemId: string;
	initialValues: ItemFormInitialValues;
}

// Edição rápida de preço: abre ao clicar no preço de um item na lista (ex:
// etiqueta divergente no mercado). Mostra só quantidade, preço e o total
// calculado — nome/unidade/status originais seguem via campos hidden
// (reaproveita o mesmo intent "edit-item" da action, sem perder esses
// dados no submit).
export function ItemPriceEditDrawer({
	open,
	onOpenChange,
	listName,
	itemId,
	initialValues,
}: ItemPriceEditDrawerProps) {
	const fetcher = useFetcher();
	const priceInputRef = useRef<HTMLInputElement>(null);

	const [quantityRaw, setQuantityRaw] = useState(
		String(initialValues.quantity),
	);
	const [price, setPrice] = useState(initialValues.price);

	const submitting = fetcher.state !== "idle";
	const quantityNumber = parseNumber(quantityRaw);
	const total = quantityNumber * price;
	const canSubmit = quantityNumber > 0;

	useEffect(() => {
		if (fetcher.data && !fetcher.data.error) {
			onOpenChange(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				initialFocus={priceInputRef}
				className="mx-auto flex w-full max-w-xl flex-col rounded-t-xl sm:min-h-auto"
			>
				<fetcher.Form method="post" className="flex min-h-0 flex-1 flex-col">
					<input type="hidden" name="intent" value="edit-item" />
					<input type="hidden" name="itemId" value={itemId} />
					<input
						type="hidden"
						name="name"
						value={initialValues.name}
						readOnly
					/>
					<input
						type="hidden"
						name="unit"
						value={initialValues.unit}
						readOnly
					/>
					<input
						type="hidden"
						name="status"
						value={initialValues.status}
						readOnly
					/>
					<input type="hidden" name="price" value={price} readOnly />

					<SheetHeader className="p-4 text-center">
						<SheetTitle>Editar preço</SheetTitle>
						<SheetDescription>
							"{initialValues.name}" em "{listName}"
						</SheetDescription>
					</SheetHeader>

					<div className="flex flex-col gap-4 p-4">
						<div className="grid grid-cols-2 gap-2 sm:gap-3">
							<Field>
								<FieldLabel htmlFor="price-edit-quantity">
									Quantidade
								</FieldLabel>
								<Input
									id="price-edit-quantity"
									name="quantity"
									inputMode="decimal"
									value={quantityRaw}
									onChange={(event) => setQuantityRaw(event.target.value)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="price-edit-price">
									Preço unitário
								</FieldLabel>
								<CurrencyInput
									ref={priceInputRef}
									id="price-edit-price"
									value={price}
									onValueChange={setPrice}
								/>
							</Field>
						</div>

						<Field>
							<Label>Total</Label>
							<div className="rounded-md border bg-muted px-3 py-2 font-bold text-sm">
								{formatCurrency(total)}
							</div>
						</Field>

						{fetcher.data?.error && (
							<p className="text-destructive text-xs">
								Não foi possível salvar. Confira os valores.
							</p>
						)}
					</div>

					<SheetFooter className="border-t p-4">
						<Button type="submit" disabled={submitting || !canSubmit}>
							{submitting ? "Salvando…" : "Salvar"}
						</Button>
					</SheetFooter>
				</fetcher.Form>
			</SheetContent>
		</Sheet>
	);
}
