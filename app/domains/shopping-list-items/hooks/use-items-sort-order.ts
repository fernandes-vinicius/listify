import { parseAsStringLiteral, useQueryState } from "nuqs";
import type { ItemSortDirection } from "~/domains/shopping-list-items/types/item-types";

const ITEM_SORT_DIRECTIONS: readonly ItemSortDirection[] = ["asc", "desc"];

// Guarda a ordenação atual da lista de itens na URL (?sort=asc|desc) — assim
// o mesmo valor usado pra destacar a opção ativa no filtro também informa em
// que posição um item novo deve entrar (ver `addItem` no service).
export function useItemsSortOrder() {
	return useQueryState("sort", parseAsStringLiteral(ITEM_SORT_DIRECTIONS));
}
