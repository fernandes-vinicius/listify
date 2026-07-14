import { Link } from "react-router";

import { getListTotals } from "~/domains/shopping-list-items";
import type { ShoppingList } from "~/domains/shopping-lists/types/shopping-list-types";
import { getBudgetStatus } from "~/domains/shopping-lists/utils/budget-status";
import { MoreVertical, Pencil, Trash2 } from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/shared/components/ui/card";
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
		<Card className="relative">
			<Link
				to={`/lists/${list.id}`}
				className="absolute inset-0"
				aria-label={`Abrir lista ${list.name}`}
			/>

			<CardHeader>
				<CardTitle>
					<h3>{list.name}</h3>
				</CardTitle>
				<CardAction>
					<DropdownMenu>
						<DropdownMenuTrigger
							className="relative z-10"
							render={
								<Button size="icon-sm" variant="ghost">
									<MoreVertical />
								</Button>
							}
						/>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onRename}>
								<Pencil />
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onDelete} variant="destructive">
								<Trash2 />
								Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="mb-2.5 flex items-center justify-between text-muted-foreground text-xs">
					<span>
						{activeCount === 0
							? "Sem itens"
							: `${totals.checkedCount}/${activeCount} itens`}
					</span>
					{isComplete && <Badge variant="tertiary">Completa</Badge>}
				</div>
				<Progress value={totals.progress} />
			</CardContent>
			{list.budget && (
				<CardFooter
					className={cn(
						"mt-auto justify-between font-normal text-xs sm:flex-col sm:justify-center sm:text-center",
						budgetStatus === "over" && "font-medium text-destructive",
						budgetStatus === "close" &&
							"font-medium text-amber-700 dark:text-amber-400",
						budgetStatus === "ok" && "text-muted-foreground",
					)}
				>
					<span>Orçamento</span>
					<span className="text-right sm:text-center">
						{formatCurrency(totals.estimatedTotal)}{" "}
						<span className="text-muted-foreground/60">
							/ {formatCurrency(list.budget)}
						</span>
					</span>
				</CardFooter>
			)}
		</Card>
	);
}
