import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from "@dnd-kit/core";

import { GripVertical } from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { cn, formatCurrency } from "~/shared/lib/utils";
import { ItemStatusToggle } from "~/domains/shopping-list-items/components/item-status-toggle";
import { getItemTotal } from "~/domains/shopping-list-items/utils/item-totals";
import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";

interface ItemRowProps {
	item: ShoppingItem;
	draggable?: boolean;
	dragHandleAttributes?: DraggableAttributes;
	dragHandleListeners?: DraggableSyntheticListeners;
	onStatusChange: (status: ItemStatus) => void;
	onEdit: () => void;
}

export function ItemRow({
	item,
	draggable,
	dragHandleAttributes,
	dragHandleListeners,
	onStatusChange,
	onEdit,
}: ItemRowProps) {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onEdit}
			onKeyDown={(event) => {
				if (event.key === "Enter") onEdit();
			}}
			className="flex cursor-pointer items-center gap-2 border-b px-3 py-3 last:border-b-0 hover:bg-muted/40 sm:gap-3.5 sm:px-4"
		>
			{draggable ? (
				<button
					type="button"
					{...dragHandleAttributes}
					{...dragHandleListeners}
					onClick={(event) => event.stopPropagation()}
					className="shrink-0 cursor-grab touch-none text-muted-foreground/40 active:cursor-grabbing"
					aria-label="Arrastar para reordenar"
				>
					<GripVertical className="size-3.5" />
				</button>
			) : (
				<span className="size-3.5 shrink-0" aria-hidden="true" />
			)}

			<ItemStatusToggle status={item.status} onChange={onStatusChange} />

			<div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2.5">
				<span
					className={cn(
						"truncate text-sm font-semibold",
						item.status === "checked" &&
							"text-muted-foreground/60 line-through decoration-muted-foreground/40",
						item.status === "have_at_home" && "text-foreground/70",
					)}
				>
					{item.name}
				</span>
				<Badge
					variant="secondary"
					className="w-fit shrink-0 font-normal text-muted-foreground"
				>
					{item.quantity} {item.unit}
				</Badge>
			</div>

			<div className="flex shrink-0 items-baseline gap-2 sm:gap-3.5">
				<span
					className={cn(
						"hidden text-right text-xs text-muted-foreground/70 sm:inline-block sm:w-14",
						item.status !== "unchecked" && "text-muted-foreground/50",
					)}
				>
					{formatCurrency(item.price)}
				</span>
				<span className="text-right text-sm font-bold sm:w-18">
					{formatCurrency(getItemTotal(item))}
				</span>
			</div>
		</div>
	);
}
