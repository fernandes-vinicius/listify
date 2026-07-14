import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { createId } from "~/shared/lib/id";

// Visão mínima do storage raiz: este domínio só precisa de `id` e `items` de
// cada lista, sem depender do tipo `ShoppingList` do domínio shopping-lists
// (evita acoplamento circular entre os dois barrels) — `AppStorage` (de
// shopping-lists-service.ts) é estruturalmente compatível e pode ser passado
// direto aqui. Funções são puras: recebem o storage já lido do cookie e
// devolvem o storage atualizado, sem tocar em cookie/request diretamente —
// isso fica a cargo do loader/action de cada rota.
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

export function addItem(
	storage: StorageShape,
	listId: string,
	input: ItemInput,
): { storage: StorageShape; item?: ShoppingItem } {
	const list = findList(storage, listId);
	if (!list) return { storage };

	const item: ShoppingItem = {
		id: createId(),
		name: input.name,
		quantity: input.quantity,
		unit: input.unit,
		price: input.price,
		status: "unchecked",
		order: list.items.length,
		createdAt: new Date().toISOString(),
	};

	return {
		storage: {
			lists: storage.lists.map((l) =>
				l.id === listId ? { ...l, items: [...l.items, item] } : l,
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
