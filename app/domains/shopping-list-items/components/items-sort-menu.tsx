import { useItemsSortOrder } from "~/domains/shopping-list-items/hooks/use-items-sort-order";
import { useSortItemsByName } from "~/domains/shopping-list-items/hooks/use-shopping-list-items";
import type { ItemSortDirection } from "~/domains/shopping-list-items/types/item-types";
import {
	ArrowDownAZ,
	ArrowDownZA,
	ArrowUpDown,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { cn } from "~/shared/lib/utils";

interface ItemsSortMenuProps {
	disabled?: boolean;
}

export function ItemsSortMenu({ disabled }: ItemsSortMenuProps) {
	const [sortOrder, setSortOrder] = useItemsSortOrder();
	const { sortItemsByName } = useSortItemsByName();

	function handleSort(direction: ItemSortDirection) {
		setSortOrder(direction);
		sortItemsByName(direction);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						size="icon-sm"
						variant="outline"
						disabled={disabled}
						aria-label="Reordenar itens"
					>
						<ArrowUpDown />
					</Button>
				}
			/>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					className={cn(sortOrder === "asc" && "font-semibold text-foreground")}
					onClick={() => handleSort("asc")}
				>
					<ArrowDownAZ />
					Nome (A-Z)
				</DropdownMenuItem>
				<DropdownMenuItem
					className={cn(
						sortOrder === "desc" && "font-semibold text-foreground",
					)}
					onClick={() => handleSort("desc")}
				>
					<ArrowDownZA />
					Nome (Z-A)
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
