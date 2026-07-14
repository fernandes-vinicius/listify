import {
	getListTotals,
	type ShoppingItem,
} from "~/domains/shopping-list-items";
import { getBudgetStatus } from "~/domains/shopping-lists/utils/budget-status";
import { TriangleAlert } from "~/shared/components/icons";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "~/shared/components/ui/alert";
import { cn, formatCurrency } from "~/shared/lib/utils";

interface BudgetAlertProps {
	budget: number | null;
	items: ShoppingItem[];
}

export function BudgetAlert({ budget, items }: BudgetAlertProps) {
	if (!budget || budget <= 0) return null;

	const { estimatedTotal } = getListTotals(items);
	const status = getBudgetStatus(estimatedTotal, budget);
	if (status === "ok") return null;

	const isOver = status === "over";
	const ratio = estimatedTotal / budget;

	return (
		<Alert
			variant={isOver ? "destructive" : "default"}
			className={cn(
				"mb-6",
				!isOver &&
					"border-amber-500/50 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
			)}
		>
			<TriangleAlert className="size-4" />
			<AlertTitle>
				{isOver ? "Orçamento ultrapassado" : "Perto do orçamento"}
			</AlertTitle>
			<AlertDescription
				className={cn(!isOver && "text-amber-700 dark:text-amber-400/80")}
			>
				{isOver
					? `O total estimado (${formatCurrency(estimatedTotal)}) já passou ${formatCurrency(estimatedTotal - budget)} do orçamento de ${formatCurrency(budget)}.`
					: `Você já usou ${Math.round(ratio * 100)}% do orçamento de ${formatCurrency(budget)} — faltam ${formatCurrency(budget - estimatedTotal)}.`}
			</AlertDescription>
		</Alert>
	);
}
