import type { ShoppingItem } from "~/domains/shopping-list-items/types/item-types";

// Faixa Unicode dos diacríticos combinantes (acentos, til, cedilha) que
// sobram depois de uma normalização NFD — ex.: "ã" vira "a" + U+0303.
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

// Além de minúsculas, remove acentos — assim buscar "limao" bate em "Limão"
// e vice-versa.
function normalizeForSearch(value: string): string {
	return value
		.trim()
		.toLocaleLowerCase("pt-BR")
		.normalize("NFD")
		.replace(COMBINING_DIACRITICS, "");
}

export function filterItemsByName(
	items: ShoppingItem[],
	query: string,
): ShoppingItem[] {
	const normalizedQuery = normalizeForSearch(query);
	if (!normalizedQuery) return items;

	return items.filter((item) =>
		normalizeForSearch(item.name).includes(normalizedQuery),
	);
}
