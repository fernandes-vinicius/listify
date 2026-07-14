import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { ItemStatusToggle } from "~/domains/shopping-list-items/components/item-status-toggle";
import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { getItemTotal } from "~/domains/shopping-list-items/utils/item-totals";
import { GripVertical } from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { cn, formatCurrency } from "~/shared/lib/utils";

interface ItemRowProps {
	item: ShoppingItem;
	draggable?: boolean;
	dragHandleAttributes?: DraggableAttributes;
	dragHandleListeners?: DraggableSyntheticListeners;
	onStatusChange: (status: ItemStatus) => void;
	onEdit: (editTarget?: "price") => void;
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
		// biome-ignore lint/a11y/useSemanticElements: <>
		<div
			role="button"
			tabIndex={0}
			onClick={() => onEdit()}
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
						"truncate font-semibold text-sm",
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

			<button
				type="button"
				onClick={(event) => {
					event.stopPropagation();
					onEdit("price");
				}}
				className="flex shrink-0 items-baseline gap-2 rounded-sm sm:gap-3.5"
			>
				<span
					className={cn(
						"hidden text-right text-muted-foreground/70 text-xs sm:inline-block sm:w-14",
						item.status !== "unchecked" && "text-muted-foreground/50",
					)}
				>
					{formatCurrency(item.price)}
				</span>
				<span className="text-right font-bold text-sm sm:w-18">
					{formatCurrency(getItemTotal(item))}
				</span>
			</button>
		</div>
	);
}
