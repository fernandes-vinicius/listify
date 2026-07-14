import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { createId, readStorage, writeStorage } from "~/shared/lib/storage";

// Visão mínima do storage raiz: este domínio só precisa de `id` e `items` de
// cada lista, sem depender do tipo `ShoppingList` do domínio shopping-lists
// (evita acoplamento circular entre os dois barrels).
interface StorageList {
	id: string;
	items: ShoppingItem[];
	[key: string]: unknown;
}

interface StorageShape {
	lists: StorageList[];
}

const EMPTY_STORAGE: StorageShape = { lists: [] };

function getStorage(): StorageShape {
	return readStorage(EMPTY_STORAGE);
}

function saveStorage(data: StorageShape): void {
	writeStorage(data);
}

function findList(data: StorageShape, listId: string): StorageList | undefined {
	return data.lists.find((list) => list.id === listId);
}

export interface ItemInput {
	name: string;
	quantity: number;
	unit: string;
	price: number;
}

export function addItem(
	listId: string,
	input: ItemInput,
): ShoppingItem | undefined {
	const data = getStorage();
	const list = findList(data, listId);
	if (!list) return undefined;

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

	list.items.push(item);
	saveStorage(data);

	return item;
}

export function updateItem(
	listId: string,
	itemId: string,
	input: ItemInput & { status: ItemStatus },
): void {
	const data = getStorage();
	const item = findList(data, listId)?.items.find((i) => i.id === itemId);
	if (!item) return;

	item.name = input.name;
	item.quantity = input.quantity;
	item.unit = input.unit;
	item.price = input.price;
	item.status = input.status;
	saveStorage(data);
}

export function deleteItem(listId: string, itemId: string): void {
	const data = getStorage();
	const list = findList(data, listId);
	if (!list) return;

	list.items = list.items.filter((item) => item.id !== itemId);
	saveStorage(data);
}

export function setItemStatus(
	listId: string,
	itemId: string,
	status: ItemStatus,
): void {
	const data = getStorage();
	const item = findList(data, listId)?.items.find((i) => i.id === itemId);
	if (!item) return;

	item.status = status;
	saveStorage(data);
}

// Recebe a ordem de um subconjunto de itens (ex.: só os "pendentes") e
// atualiza apenas o `order` desses itens — os demais permanecem intactos,
// para não perder itens "comprados"/"tenho em casa" fora do subconjunto.
export function reorderItems(listId: string, orderedItemIds: string[]): void {
	const data = getStorage();
	const list = findList(data, listId);
	if (!list) return;

	const orderIndexById = new Map(
		orderedItemIds.map((id, index) => [id, index]),
	);
	list.items = list.items.map((item) => {
		const newOrder = orderIndexById.get(item.id);
		return newOrder === undefined ? item : { ...item, order: newOrder };
	});

	saveStorage(data);
}
