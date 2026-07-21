import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

import { ItemRow } from "~/domains/shopping-list-items/components/item-row";
import { SortableItemRow } from "~/domains/shopping-list-items/components/sortable-item-list";
import type {
	ItemStatus,
	ShoppingGroup,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { getGroupTotal } from "~/domains/shopping-list-items/utils/item-totals";
import {
	ChevronDown,
	MoreVertical,
	Pencil,
	Trash2,
} from "~/shared/components/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { cn, formatCurrency } from "~/shared/lib/utils";

interface GroupSectionProps {
	group: ShoppingGroup;
	items: ShoppingItem[];
	// Itens do grupo já comprados/tenho em casa — não arrastáveis, só exibidos
	// (riscado/atenuado) pra não sumirem do grupo quando o status muda.
	settledItems: ShoppingItem[];
	allItems: ShoppingItem[];
	onToggleCollapsed: (groupId: string) => void;
	onRename: (group: ShoppingGroup) => void;
	onDelete: (group: ShoppingGroup) => void;
	onStatusChange: (itemId: string, status: ItemStatus) => void;
	onEditItem: (itemId: string, editTarget?: "price") => void;
	onDeleteItem: (itemId: string) => void;
}

export function GroupSection({
	group,
	items,
	settledItems,
	allItems,
	onToggleCollapsed,
	onRename,
	onDelete,
	onStatusChange,
	onEditItem,
	onDeleteItem,
}: GroupSectionProps) {
	const { setNodeRef, isOver } = useDroppable({ id: group.id });
	const [menuOpen, setMenuOpen] = useState(false);
	const total = getGroupTotal(allItems, group.id);
	const totalCount = items.length + settledItems.length;

	return (
		<div className="mb-2.5 overflow-hidden rounded-lg border bg-card">
			{/* biome-ignore lint/a11y/useSemanticElements: <> */}
			<div
				role="button"
				tabIndex={0}
				onClick={() => onToggleCollapsed(group.id)}
				onKeyDown={(event) => {
					if (event.key === "Enter") onToggleCollapsed(group.id);
				}}
				className="flex cursor-pointer items-center gap-2.5 px-3 py-3 hover:bg-muted"
			>
				<ChevronDown
					className={cn(
						"size-4 shrink-0 text-muted-foreground transition-transform",
						group.collapsed && "-rotate-90",
					)}
				/>
				<div className="flex min-w-0 flex-1 items-baseline gap-2">
					<span className="truncate font-bold text-sm">{group.name}</span>
					<span className="shrink-0 text-muted-foreground text-xs">
						{totalCount} {totalCount === 1 ? "item" : "itens"}
					</span>
				</div>
				<span className="shrink-0 font-semibold text-sm">
					{formatCurrency(total)}
				</span>

				<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
					<DropdownMenuTrigger
						render={
							<button
								type="button"
								aria-label={`Opções do grupo ${group.name}`}
								className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
								onClick={(event) => event.stopPropagation()}
							>
								<MoreVertical className="size-3.5" />
							</button>
						}
					/>
					<DropdownMenuContent
						align="end"
						onClick={(event) => event.stopPropagation()}
					>
						<DropdownMenuItem onClick={() => onRename(group)}>
							<Pencil className="size-3.5" />
							Renomear
						</DropdownMenuItem>
						<DropdownMenuItem
							variant="destructive"
							onClick={() => onDelete(group)}
						>
							<Trash2 className="size-3.5" />
							Remover grupo
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{!group.collapsed && (
				<div
					ref={setNodeRef}
					className={cn(
						"min-h-11 border-t transition-colors",
						isOver && "bg-primary/5 ring-1 ring-primary/40 ring-inset",
					)}
				>
					<SortableContext
						items={items.map((item) => item.id)}
						strategy={verticalListSortingStrategy}
					>
						{items.length === 0 && settledItems.length === 0 ? (
							<p className="px-3 py-3.5 text-center text-muted-foreground/70 text-xs italic">
								Arraste itens pendentes pra cá
							</p>
						) : (
							items.map((item) => (
								<SortableItemRow
									key={item.id}
									item={item}
									onStatusChange={(status) => onStatusChange(item.id, status)}
									onEditItem={(editTarget) => onEditItem(item.id, editTarget)}
									onDeleteItem={() => onDeleteItem(item.id)}
								/>
							))
						)}
					</SortableContext>

					{settledItems.map((item) => (
						<ItemRow
							key={item.id}
							item={item}
							onStatusChange={(status) => onStatusChange(item.id, status)}
							onEdit={(editTarget) => onEditItem(item.id, editTarget)}
							onDelete={() => onDeleteItem(item.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
