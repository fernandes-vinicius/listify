import { ItemRow } from "~/domains/shopping-list-items/components/item-row";
import { SortableItemList } from "~/domains/shopping-list-items/components/sortable-item-list";
import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { cn } from "~/shared/lib/utils";

const SECTION_META: Record<
	ItemStatus,
	{ title: string; dotClassName: string }
> = {
	unchecked: { title: "Pendentes", dotClassName: "bg-muted-foreground/50" },
	checked: {
		title: "Comprados",
		dotClassName: "bg-green-600 dark:bg-green-500",
	},
	have_at_home: { title: "Tenho em casa", dotClassName: "bg-amber-500" },
};

interface ItemSectionProps {
	status: ItemStatus;
	items: ShoppingItem[];
	sortable?: boolean;
	onReorder?: (itemIds: string[]) => void;
	onStatusChange: (itemId: string, status: ItemStatus) => void;
	onEditItem: (itemId: string, focusField?: "price") => void;
}

export function ItemSection({
	status,
	items,
	sortable = false,
	onReorder,
	onStatusChange,
	onEditItem,
}: ItemSectionProps) {
	if (items.length === 0) return null;

	const meta = SECTION_META[status];

	return (
		<section className="mb-5">
			<div className="mb-2.5 flex items-center gap-2 px-0.5">
				<span
					className={cn("size-2 shrink-0 rounded-full", meta.dotClassName)}
					aria-hidden="true"
				/>
				<h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wide">
					{meta.title}
				</h3>
				<span className="font-semibold text-muted-foreground/60 text-xs">
					· {items.length}
				</span>
			</div>

			<div className="overflow-hidden rounded-lg border bg-card">
				{sortable && onReorder ? (
					<SortableItemList
						items={items}
						onReorder={onReorder}
						onStatusChange={onStatusChange}
						onEditItem={onEditItem}
					/>
				) : (
					items.map((item) => (
						<ItemRow
							key={item.id}
							item={item}
							onStatusChange={(next) => onStatusChange(item.id, next)}
							onEdit={(focusField) => onEditItem(item.id, focusField)}
						/>
					))
				)}
			</div>
		</section>
	);
}
