import type { ShoppingItem } from "~/domains/shopping-list-items/types/item-types";
import { getListTotals } from "~/domains/shopping-list-items/utils/item-totals";
import { Card, CardContent, CardFooter } from "~/shared/components/ui/card";
import { Progress } from "~/shared/components/ui/progress";
import { formatCurrency } from "~/shared/lib/utils";

interface ListTotalsSummaryProps {
	items: ShoppingItem[];
}

export function ListTotalsSummary({ items }: ListTotalsSummaryProps) {
	const totals = getListTotals(items);
	const activeCount = totals.checkedCount + totals.uncheckedCount;

	return (
		<Card
			size="sm"
			className="flex flex-col px-(--card-spacing) sm:flex-row sm:items-center"
		>
			<CardContent className="flex-1 px-0">
				<div className="mb-2 flex flex-wrap justify-between gap-1 font-medium text-muted-foreground text-xs">
					<span>
						<span className="font-medium text-foreground">
							{totals.checkedCount}
						</span>{" "}
						de{" "}
						<span className="font-medium text-foreground">{activeCount}</span>{" "}
						itens comprados
					</span>
					<span>{totals.progress}%</span>
				</div>
				<Progress value={totals.progress} />
			</CardContent>
			<CardFooter className="grid grid-cols-2 gap-4 px-0 pt-2 sm:contents">
				<div className="sm:border-l sm:pl-6 sm:text-right">
					<div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
						Total da compra
					</div>
					<div className="mt-0.5 font-medium text-lg sm:text-xl">
						{formatCurrency(totals.purchasedTotal)}
					</div>
				</div>
				<div className="sm:border-l sm:pl-6 sm:text-right">
					<div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
						Total estimado
					</div>
					<div className="mt-0.5 font-medium text-base text-muted-foreground sm:text-lg">
						{formatCurrency(totals.estimatedTotal)}
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
