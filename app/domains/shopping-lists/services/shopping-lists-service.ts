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

// Dados salvos antes do recurso de agrupamento não têm `list.groups` nem
// `item.groupId` — o guard raso de `readStorage` (ver shared/lib/storage.ts)
// só valida que `storage.lists` é array, não o formato interno de cada
// lista/item, então listas antigas passam por ele sem esses campos.
// Normalizamos aqui, num único lugar, pra todo consumidor (rotas, serviços)
// sempre receber o formato completo e não quebrar em `.map`/`.filter`.
function normalizeList(list: ShoppingList): ShoppingList {
	return {
		...list,
		groups: list.groups ?? [],
		items: list.items.map((item) => ({
			...item,
			groupId: item.groupId ?? null,
		})),
	};
}

export function getShoppingLists(storage: AppStorage): ShoppingList[] {
	return storage.lists.map(normalizeList);
}

// Mesma normalização de `getShoppingLists`, mas devolvendo o `AppStorage`
// inteiro (não só a lista de listas) — para uso em `clientAction`s, que
// passam o storage bruto (lido direto do localStorage, sem passar por
// `getShoppingLists`/`getShoppingListById`) pros serviços de mutação. Sem
// isso, `shopping-groups-service.ts` (que assume `list.groups` já existe)
// quebra ao operar sobre uma lista salva antes do recurso de agrupamento.
export function normalizeStorage(storage: AppStorage): AppStorage {
	return { lists: storage.lists.map(normalizeList) };
}

export function getShoppingListById(
	storage: AppStorage,
	id: string,
): ShoppingList | undefined {
	const list = storage.lists.find((list) => list.id === id);
	return list ? normalizeList(list) : undefined;
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
		groups: [],
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
