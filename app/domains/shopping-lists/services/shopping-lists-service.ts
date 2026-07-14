import type { ShoppingList } from "~/domains/shopping-lists/types/shopping-list-types";
import { createId } from "~/shared/lib/id";

// Formato completo gravado no localStorage (ver shared/lib/storage.ts) — a
// única "raiz" de dados do app. Funções aqui são puras: recebem o storage já
// lido e devolvem o storage atualizado, sem tocar em localStorage diretamente
// — isso fica a cargo do clientLoader/clientAction de cada rota.
export interface AppStorage {
	lists: ShoppingList[];
}

export const EMPTY_STORAGE: AppStorage = { lists: [] };

export function getShoppingLists(storage: AppStorage): ShoppingList[] {
	return storage.lists;
}

export function getShoppingListById(
	storage: AppStorage,
	id: string,
): ShoppingList | undefined {
	return storage.lists.find((list) => list.id === id);
}

export function createShoppingList(
	storage: AppStorage,
	name: string,
	budget: number | null = null,
): { storage: AppStorage; list: ShoppingList } {
	const now = new Date().toISOString();
	const list: ShoppingList = {
		id: createId(),
		name,
		budget,
		createdAt: now,
		updatedAt: now,
		items: [],
	};

	return { storage: { lists: [...storage.lists, list] }, list };
}

export interface UpdateShoppingListInput {
	name: string;
	budget: number | null;
}

export function updateShoppingList(
	storage: AppStorage,
	id: string,
	input: UpdateShoppingListInput,
): AppStorage {
	return {
		lists: storage.lists.map((list) =>
			list.id === id
				? {
						...list,
						name: input.name,
						budget: input.budget,
						updatedAt: new Date().toISOString(),
					}
				: list,
		),
	};
}

export function deleteShoppingList(
	storage: AppStorage,
	id: string,
): AppStorage {
	return { lists: storage.lists.filter((list) => list.id !== id) };
}
