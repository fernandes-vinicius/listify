import { createId, readStorage, writeStorage } from "~/shared/lib/storage";
import type { ShoppingList } from "~/domains/shopping-lists/types/shopping-list-types";

interface StorageShape {
	lists: ShoppingList[];
}

const EMPTY_STORAGE: StorageShape = { lists: [] };

function getStorage(): StorageShape {
	return readStorage(EMPTY_STORAGE);
}

function saveStorage(data: StorageShape): void {
	writeStorage(data);
}

export function getShoppingLists(): ShoppingList[] {
	return getStorage().lists;
}

export function getShoppingListById(id: string): ShoppingList | undefined {
	return getStorage().lists.find((list) => list.id === id);
}

export function createShoppingList(
	name: string,
	budget: number | null = null,
): ShoppingList {
	const now = new Date().toISOString();
	const list: ShoppingList = {
		id: createId(),
		name,
		budget,
		createdAt: now,
		updatedAt: now,
		items: [],
	};

	const data = getStorage();
	data.lists.push(list);
	saveStorage(data);

	return list;
}

export interface UpdateShoppingListInput {
	name: string;
	budget: number | null;
}

export function updateShoppingList(
	id: string,
	input: UpdateShoppingListInput,
): void {
	const data = getStorage();
	const list = data.lists.find((l) => l.id === id);
	if (!list) return;

	list.name = input.name;
	list.budget = input.budget;
	list.updatedAt = new Date().toISOString();
	saveStorage(data);
}

export function deleteShoppingList(id: string): void {
	const data = getStorage();
	data.lists = data.lists.filter((list) => list.id !== id);
	saveStorage(data);
}
