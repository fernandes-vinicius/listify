import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ItemRow } from "~/domains/shopping-list-items/components/item-row";
import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";

interface SortableItemListProps {
	items: ShoppingItem[];
	onReorder: (itemIds: string[]) => void;
	onStatusChange: (itemId: string, status: ItemStatus) => void;
	onEditItem: (itemId: string, editTarget?: "price") => void;
}

function SortableItemRow({
	item,
	onStatusChange,
	onEditItem,
}: {
	item: ShoppingItem;
	onStatusChange: (status: ItemStatus) => void;
	onEditItem: (editTarget?: "price") => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: item.id,
	});

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={isDragging ? "opacity-50" : undefined}
		>
			<ItemRow
				item={item}
				draggable
				dragHandleAttributes={attributes}
				dragHandleListeners={listeners}
				onStatusChange={onStatusChange}
				onEdit={onEditItem}
			/>
		</div>
	);
}

export function SortableItemList({
	items,
	onReorder,
	onStatusChange,
	onEditItem,
}: SortableItemListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = items.findIndex((item) => item.id === active.id);
		const newIndex = items.findIndex((item) => item.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		onReorder(arrayMove(items, oldIndex, newIndex).map((item) => item.id));
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={items.map((item) => item.id)}
				strategy={verticalListSortingStrategy}
			>
				{items.map((item) => (
					<SortableItemRow
						key={item.id}
						item={item}
						onStatusChange={(status) => onStatusChange(item.id, status)}
						onEditItem={(editTarget) => onEditItem(item.id, editTarget)}
					/>
				))}
			</SortableContext>
		</DndContext>
	);
}
