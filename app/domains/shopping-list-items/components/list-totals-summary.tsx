import { Progress } from "~/shared/components/ui/progress";
import { getListTotals } from "~/domains/shopping-list-items/utils/item-totals";
import type { ShoppingItem } from "~/domains/shopping-list-items/types/item-types";
import { formatCurrency } from "~/shared/lib/utils";

interface ListTotalsSummaryProps {
	items: ShoppingItem[];
}

export function ListTotalsSummary({ items }: ListTotalsSummaryProps) {
	const totals = getListTotals(items);
	const activeCount = totals.checkedCount + totals.uncheckedCount;

	return (
		<div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
			<div className="flex-1">
				<div className="mb-2 flex flex-wrap justify-between gap-1 text-xs font-medium text-muted-foreground">
					<span>
						<span className="font-semibold text-foreground">
							{totals.checkedCount}
						</span>{" "}
						de{" "}
						<span className="font-semibold text-foreground">{activeCount}</span>{" "}
						itens comprados
					</span>
					<span>{totals.progress}%</span>
				</div>
				<Progress value={totals.progress} />
			</div>

			<div className="grid grid-cols-2 gap-4 border-t pt-4 sm:contents">
				<div className="sm:border-l sm:pl-5 sm:text-right">
					<div className="text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
						Total da compra
					</div>
					<div className="mt-0.5 text-lg font-bold sm:text-xl">
						{formatCurrency(totals.purchasedTotal)}
					</div>
				</div>

				<div className="sm:border-l sm:pl-5 sm:text-right">
					<div className="text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
						Total estimado
					</div>
					<div className="mt-0.5 text-base font-semibold text-muted-foreground sm:text-lg">
						{formatCurrency(totals.estimatedTotal)}
					</div>
				</div>
			</div>
		</div>
	);
}
