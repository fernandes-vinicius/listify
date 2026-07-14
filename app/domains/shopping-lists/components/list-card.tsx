import { Link } from "react-router";
import { getListTotals } from "~/domains/shopping-list-items";
import type { ShoppingList } from "~/domains/shopping-lists/types/shopping-list-types";
import { getBudgetStatus } from "~/domains/shopping-lists/utils/budget-status";
import { MoreVertical, Pencil, Trash2 } from "~/shared/components/icons";
import { Card } from "~/shared/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { Progress } from "~/shared/components/ui/progress";
import { cn, formatCurrency } from "~/shared/lib/utils";

interface ListCardProps {
	list: ShoppingList;
	onRename: () => void;
	onDelete: () => void;
}

export function ListCard({ list, onRename, onDelete }: ListCardProps) {
	const totals = getListTotals(list.items);
	const activeCount = totals.checkedCount + totals.uncheckedCount;
	const isComplete = activeCount > 0 && totals.checkedCount === activeCount;

	const budgetStatus = list.budget
		? getBudgetStatus(totals.estimatedTotal, list.budget)
		: null;

	return (
		<Card className="relative gap-3 p-4 sm:p-5">
			<Link
				to={`/lists/${list.id}`}
				className="absolute inset-0"
				aria-label={`Abrir lista ${list.name}`}
			/>

			<div className="flex items-start justify-between gap-2">
				<h3 className="font-semibold text-base">{list.name}</h3>
				<DropdownMenu>
					<DropdownMenuTrigger className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
						<MoreVertical className="size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onRename}>
							<Pencil className="size-3.5" />
							Editar
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onDelete} variant="destructive">
							<Trash2 className="size-3.5" />
							Excluir
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex items-center justify-between font-medium text-muted-foreground text-xs">
				<span>
					{activeCount === 0
						? "Sem itens"
						: `${totals.checkedCount}/${activeCount} itens`}
				</span>
				{isComplete && (
					<span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-[11px] text-green-700 dark:bg-green-500/15 dark:text-green-400">
						Completa
					</span>
				)}
			</div>

			<Progress value={totals.progress} />

			{list.budget && (
				<div
					className={cn(
						"flex items-center justify-between text-xs",
						budgetStatus === "over" && "font-semibold text-destructive",
						budgetStatus === "close" &&
							"font-semibold text-amber-700 dark:text-amber-400",
						budgetStatus === "ok" && "text-muted-foreground",
					)}
				>
					<span>Orçamento</span>
					<span>
						{formatCurrency(totals.estimatedTotal)}{" "}
						<span className="text-muted-foreground/60">
							/ {formatCurrency(list.budget)}
						</span>
					</span>
				</div>
			)}
		</Card>
	);
}
