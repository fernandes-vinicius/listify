import type { ShoppingItem } from "~/domains/shopping-list-items";

export interface ShoppingList {
	id: string;
	name: string;
	// Valor máximo que o usuário pretende gastar nessa lista; null = sem
	// orçamento definido (campo opcional).
	budget: number | null;
	createdAt: string;
	updatedAt: string;
	items: ShoppingItem[];
}
