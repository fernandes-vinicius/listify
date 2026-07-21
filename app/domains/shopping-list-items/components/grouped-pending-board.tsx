import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";

import { GroupSection } from "~/domains/shopping-list-items/components/group-section";
import { SortableItemRow } from "~/domains/shopping-list-items/components/sortable-item-list";
import type { ItemPlacement } from "~/domains/shopping-list-items/services/shopping-groups-service";
import type {
	ItemStatus,
	ShoppingGroup,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { Folder } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

const UNGROUPED = "ungrouped" as const;

interface GroupedPendingBoardProps {
	groups: ShoppingGroup[];
	items: ShoppingItem[]; // itens pendentes (status "unchecked")
	allItems: ShoppingItem[]; // lista inteira, pro total de cada grupo
	onToggleCollapsed: (groupId: string) => void;
	onRenameGroup: (group: ShoppingGroup) => void;
	onDeleteGroup: (group: ShoppingGroup) => void;
	onMoveItems: (placements: ItemPlacement[]) => void;
	onStatusChange: (itemId: string, status: ItemStatus) => void;
	onEditItem: (itemId: string, editTarget?: "price") => void;
	onDeleteItem: (itemId: string) => void;
}

type Containers = Record<string, string[]>;

function buildContainers(
	groups: ShoppingGroup[],
	items: ShoppingItem[],
): Containers {
	const sorted = [...items].sort((a, b) => a.order - b.order);
	const containers: Containers = { [UNGROUPED]: [] };
	for (const group of groups) containers[group.id] = [];

	for (const item of sorted) {
		const key =
			item.groupId && containers[item.groupId] ? item.groupId : UNGROUPED;
		containers[key].push(item.id);
	}

	return containers;
}

function UngroupedZone({
	itemIds,
	itemsById,
	onStatusChange,
	onEditItem,
	onDeleteItem,
}: {
	itemIds: string[];
	itemsById: Map<string, ShoppingItem>;
	onStatusChange: (itemId: string, status: ItemStatus) => void;
	onEditItem: (itemId: string, editTarget?: "price") => void;
	onDeleteItem: (itemId: string) => void;
}) {
	const { setNodeRef, isOver } = useDroppable({ id: UNGROUPED });

	return (
		<>
			<div className="mb-2 flex items-center gap-1.5 px-0.5 text-muted-foreground text-xs">
				<Folder className="size-3.5" />
				<span className="font-semibold uppercase tracking-wide">Sem grupo</span>
				<span className="text-muted-foreground/70">· {itemIds.length}</span>
			</div>
			<div
				ref={setNodeRef}
				className={cn(
					"min-h-11 overflow-hidden rounded-lg border bg-card transition-colors",
					isOver && "ring-1 ring-primary/40 ring-inset",
				)}
			>
				<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
					{itemIds.length === 0 ? (
						<p className="px-3 py-3.5 text-center text-muted-foreground/70 text-xs italic">
							Nenhum item solto
						</p>
					) : (
						itemIds.map((id) => {
							const item = itemsById.get(id);
							if (!item) return null;
							return (
								<SortableItemRow
									key={item.id}
									item={item}
									onStatusChange={(status) => onStatusChange(item.id, status)}
									onEditItem={(editTarget) => onEditItem(item.id, editTarget)}
									onDeleteItem={() => onDeleteItem(item.id)}
								/>
							);
						})
					)}
				</SortableContext>
			</div>
		</>
	);
}

export function GroupedPendingBoard({
	groups,
	items,
	allItems,
	onToggleCollapsed,
	onRenameGroup,
	onDeleteGroup,
	onMoveItems,
	onStatusChange,
	onEditItem,
	onDeleteItem,
}: GroupedPendingBoardProps) {
	const [containers, setContainers] = useState<Containers>(() =>
		buildContainers(groups, items),
	);
	// dnd-kit dispara `onDragEnd` logo em seguida do último `onDragOver` — perto
	// demais pra garantir que o re-render do `setContainers` já tenha comitado.
	// Se `handleDragEnd` lesse o `containers` fechado no closure do render
	// anterior, um drag rápido entre containers persistiria uma posição
	// desatualizada (a UI parece certa, mas o placement enviado não inclui o
	// último container). Uma ref espelhada e atualizada de forma síncrona evita
	// essa corrida — `handleDragEnd` sempre lê o valor mais recente.
	const containersRef = useRef(containers);

	function updateContainers(updater: (prev: Containers) => Containers) {
		const next = updater(containersRef.current);
		containersRef.current = next;
		setContainers(next);
	}

	// Ressincroniza sempre que a lista de grupos/itens muda (ex.: após uma
	// mutação persistida e revalidada pelo loader) — fora de um drag em
	// andamento (que só mexe em estado local), isso mantém o board fiel aos
	// dados reais.
	useEffect(() => {
		const next = buildContainers(groups, items);
		containersRef.current = next;
		setContainers(next);
	}, [groups, items]);

	const itemsById = useMemo(
		() => new Map(items.map((item) => [item.id, item])),
		[items],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	);

	function findContainer(id: string): string | undefined {
		const current = containersRef.current;
		if (id in current) return id;
		return Object.keys(current).find((key) => current[key].includes(id));
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeContainer = findContainer(String(active.id));
		const overContainer = findContainer(String(over.id));
		if (
			!activeContainer ||
			!overContainer ||
			activeContainer === overContainer
		) {
			return;
		}

		updateContainers((prev) => {
			const activeItems = prev[activeContainer];
			const overItems = prev[overContainer];
			const overIndex = overItems.indexOf(String(over.id));
			const newIndex = overIndex >= 0 ? overIndex : overItems.length;

			return {
				...prev,
				[activeContainer]: activeItems.filter((id) => id !== active.id),
				[overContainer]: [
					...overItems.slice(0, newIndex),
					String(active.id),
					...overItems.slice(newIndex),
				],
			};
		});
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeContainer = findContainer(String(active.id));
		const overContainer = findContainer(String(over.id));
		if (!activeContainer || !overContainer) return;

		if (activeContainer === overContainer) {
			const containerItems = containersRef.current[activeContainer];
			const oldIndex = containerItems.indexOf(String(active.id));
			const newIndex = containerItems.indexOf(String(over.id));
			if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
				updateContainers((prev) => ({
					...prev,
					[activeContainer]: arrayMove(containerItems, oldIndex, newIndex),
				}));
			}
		}

		const placements: ItemPlacement[] = [];
		for (const [containerId, itemIds] of Object.entries(
			containersRef.current,
		)) {
			itemIds.forEach((itemId, index) => {
				placements.push({
					itemId,
					groupId: containerId === UNGROUPED ? null : containerId,
					order: index,
				});
			});
		}
		onMoveItems(placements);
	}

	const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			{sortedGroups.map((group) => (
				<GroupSection
					key={group.id}
					group={group}
					items={(containers[group.id] ?? [])
						.map((id) => itemsById.get(id))
						.filter((item): item is ShoppingItem => item !== undefined)}
					allItems={allItems}
					onToggleCollapsed={onToggleCollapsed}
					onRename={onRenameGroup}
					onDelete={onDeleteGroup}
					onStatusChange={onStatusChange}
					onEditItem={onEditItem}
					onDeleteItem={onDeleteItem}
				/>
			))}

			<UngroupedZone
				itemIds={containers[UNGROUPED] ?? []}
				itemsById={itemsById}
				onStatusChange={onStatusChange}
				onEditItem={onEditItem}
				onDeleteItem={onDeleteItem}
			/>
		</DndContext>
	);
}
