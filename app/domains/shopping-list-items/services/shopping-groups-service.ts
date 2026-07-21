import type {
	ShoppingGroup,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { createId } from "~/shared/lib/id";

// Mesma visão mínima do storage raiz usada em shopping-list-items-service.ts
// (evita acoplamento circular com o domínio shopping-lists) — `AppStorage` é
// estruturalmente compatível e pode ser passado direto aqui.
interface StorageList {
	id: string;
	groups: ShoppingGroup[];
	items: ShoppingItem[];
}

interface StorageShape {
	lists: StorageList[];
}

export function createGroup(
	storage: StorageShape,
	listId: string,
	name: string,
): { storage: StorageShape; group?: ShoppingGroup } {
	const list = storage.lists.find((l) => l.id === listId);
	if (!list) return { storage };

	const group: ShoppingGroup = {
		id: createId(),
		name,
		order: list.groups.length,
		collapsed: false,
	};

	return {
		storage: {
			lists: storage.lists.map((l) =>
				l.id === listId ? { ...l, groups: [...l.groups, group] } : l,
			),
		},
		group,
	};
}

export function renameGroup(
	storage: StorageShape,
	listId: string,
	groupId: string,
	name: string,
): StorageShape {
	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: {
						...list,
						groups: list.groups.map((group) =>
							group.id === groupId ? { ...group, name } : group,
						),
					},
		),
	};
}

// Remove o grupo e solta os itens que pertenciam a ele (groupId -> null) —
// nenhum item é excluído, só perde o agrupamento.
export function deleteGroup(
	storage: StorageShape,
	listId: string,
	groupId: string,
): StorageShape {
	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: {
						...list,
						groups: list.groups.filter((group) => group.id !== groupId),
						items: list.items.map((item) =>
							item.groupId === groupId ? { ...item, groupId: null } : item,
						),
					},
		),
	};
}

export function toggleGroupCollapsed(
	storage: StorageShape,
	listId: string,
	groupId: string,
): StorageShape {
	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: {
						...list,
						groups: list.groups.map((group) =>
							group.id === groupId
								? { ...group, collapsed: !group.collapsed }
								: group,
						),
					},
		),
	};
}

export interface ItemPlacement {
	itemId: string;
	groupId: string | null;
	order: number;
}

// Aplica de uma vez a posição final (grupo + ordem) de um conjunto de itens —
// usado pelo drag-and-drop multi-container do board de "Pendentes" agrupada
// (arrastar entre grupos e o bucket "sem grupo"). Segue a mesma convenção de
// `reorderItems` (shopping-list-items-service.ts): só reatribui `order`
// dentro do subconjunto recebido, os demais itens da lista ficam intactos.
export function updateItemPlacements(
	storage: StorageShape,
	listId: string,
	placements: ItemPlacement[],
): StorageShape {
	const placementById = new Map(placements.map((p) => [p.itemId, p]));

	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: {
						...list,
						items: list.items.map((item) => {
							const placement = placementById.get(item.id);
							return placement
								? {
										...item,
										groupId: placement.groupId,
										order: placement.order,
									}
								: item;
						}),
					},
		),
	};
}
