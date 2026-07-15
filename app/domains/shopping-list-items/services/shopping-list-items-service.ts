import type {
	ItemSortDirection,
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { createId } from "~/shared/lib/id";

// Visão mínima do storage raiz: este domínio só precisa de `id` e `items` de
// cada lista, sem depender do tipo `ShoppingList` do domínio shopping-lists
// (evita acoplamento circular entre os dois barrels) — `AppStorage` (de
// shopping-lists-service.ts) é estruturalmente compatível e pode ser passado
// direto aqui. Funções são puras: recebem o storage já lido do localStorage e
// devolvem o storage atualizado, sem tocar em localStorage diretamente —
// isso fica a cargo do clientLoader/clientAction de cada rota.
interface StorageList {
	id: string;
	items: ShoppingItem[];
}

interface StorageShape {
	lists: StorageList[];
}

function findList(
	storage: StorageShape,
	listId: string,
): StorageList | undefined {
	return storage.lists.find((list) => list.id === listId);
}

export interface ItemInput {
	name: string;
	quantity: number;
	unit: string;
	price: number;
}

function compareNames(
	a: string,
	b: string,
	direction: ItemSortDirection,
): number {
	const comparison = a.localeCompare(b, "pt-BR", { sensitivity: "base" });
	return direction === "asc" ? comparison : -comparison;
}

// Acha em que posição (dentre os itens já ordenados por `order`) um item com
// esse nome deveria entrar, seguindo a mesma ordenação de `sortItemsByName` —
// primeiro item existente que "vem depois" do novo nome.
function findSortedInsertIndex(
	items: ShoppingItem[],
	name: string,
	direction: ItemSortDirection,
): number {
	const index = items.findIndex(
		(existing) => compareNames(name, existing.name, direction) < 0,
	);
	return index === -1 ? items.length : index;
}

export function addItem(
	storage: StorageShape,
	listId: string,
	input: ItemInput,
	sortDirection?: ItemSortDirection | null,
): { storage: StorageShape; item?: ShoppingItem } {
	const list = findList(storage, listId);
	if (!list) return { storage };

	const currentItems = [...list.items].sort((a, b) => a.order - b.order);
	const insertIndex = sortDirection
		? findSortedInsertIndex(currentItems, input.name, sortDirection)
		: currentItems.length;

	const item: ShoppingItem = {
		id: createId(),
		name: input.name,
		quantity: input.quantity,
		unit: input.unit,
		price: input.price,
		status: "unchecked",
		order: insertIndex,
		createdAt: new Date().toISOString(),
	};

	const nextItems = [
		...currentItems.slice(0, insertIndex),
		item,
		...currentItems.slice(insertIndex),
	].map((existing, index) => ({ ...existing, order: index }));

	return {
		storage: {
			lists: storage.lists.map((l) =>
				l.id === listId ? { ...l, items: nextItems } : l,
			),
		},
		item,
	};
}

export function updateItem(
	storage: StorageShape,
	listId: string,
	itemId: string,
	input: ItemInput & { status: ItemStatus },
): StorageShape {
	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: {
						...list,
						items: list.items.map((item) =>
							item.id !== itemId
								? item
								: {
										...item,
										name: input.name,
										quantity: input.quantity,
										unit: input.unit,
										price: input.price,
										status: input.status,
									},
						),
					},
		),
	};
}

export function deleteItem(
	storage: StorageShape,
	listId: string,
	itemId: string,
): StorageShape {
	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: { ...list, items: list.items.filter((item) => item.id !== itemId) },
		),
	};
}

export function setItemStatus(
	storage: StorageShape,
	listId: string,
	itemId: string,
	status: ItemStatus,
): StorageShape {
	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: {
						...list,
						items: list.items.map((item) =>
							item.id === itemId ? { ...item, status } : item,
						),
					},
		),
	};
}

// Marca/desmarca todos os itens da lista de uma vez (ex: "Desmarcar todos"
// pra reaproveitar a lista numa próxima compra, ou "Marcar todos como
// comprados"). Afeta todo item da lista, independente do status atual.
export function setAllItemsStatus(
	storage: StorageShape,
	listId: string,
	status: ItemStatus,
): StorageShape {
	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: { ...list, items: list.items.map((item) => ({ ...item, status })) },
		),
	};
}

// Reordena todos os itens da lista pelo nome (A-Z ou Z-A), reatribuindo
// `order` de acordo — diferente de `reorderItems` (que só reordena um
// subconjunto, ex.: drag-and-drop dentro de uma seção), esse afeta a lista
// inteira de uma vez.
export function sortItemsByName(
	storage: StorageShape,
	listId: string,
	direction: ItemSortDirection,
): StorageShape {
	return {
		lists: storage.lists.map((list) => {
			if (list.id !== listId) return list;

			const sorted = [...list.items].sort((a, b) =>
				compareNames(a.name, b.name, direction),
			);

			return {
				...list,
				items: sorted.map((item, index) => ({ ...item, order: index })),
			};
		}),
	};
}

// Recebe a ordem de um subconjunto de itens (ex.: só os "pendentes") e
// atualiza apenas o `order` desses itens — os demais permanecem intactos,
// para não perder itens "comprados"/"tenho em casa" fora do subconjunto.
export function reorderItems(
	storage: StorageShape,
	listId: string,
	orderedItemIds: string[],
): StorageShape {
	const orderIndexById = new Map(
		orderedItemIds.map((id, index) => [id, index]),
	);

	return {
		lists: storage.lists.map((list) =>
			list.id !== listId
				? list
				: {
						...list,
						items: list.items.map((item) => {
							const newOrder = orderIndexById.get(item.id);
							return newOrder === undefined
								? item
								: { ...item, order: newOrder };
						}),
					},
		),
	};
}
