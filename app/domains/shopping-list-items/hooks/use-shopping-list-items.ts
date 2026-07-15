import { useFetcher } from "react-router";
import type {
	ItemSortDirection,
	ItemStatus,
} from "~/domains/shopping-list-items/types/item-types";

// Adicionar e editar item são conduzidos pelo próprio `ItemFormDrawer` via
// `fetcher.Form` + Conform (ver item-form-drawer.tsx), não por hooks
// imperativos — Conform precisa que o form real submeta para receber de volta
// o `lastResult` (erros de validação) no `fetcher.data`.

export function useDeleteItem() {
	const fetcher = useFetcher();

	function deleteItem(itemId: string) {
		fetcher.submit({ intent: "delete-item", itemId }, { method: "post" });
	}

	return { deleteItem, isSubmitting: fetcher.state !== "idle" };
}

export function useToggleItemStatus() {
	const fetcher = useFetcher();

	function setItemStatus(itemId: string, status: ItemStatus) {
		fetcher.submit(
			{ intent: "toggle-status", itemId, status },
			{ method: "post" },
		);
	}

	return { setItemStatus, isSubmitting: fetcher.state !== "idle" };
}

export function useReorderItems() {
	const fetcher = useFetcher();

	function reorderItems(itemIds: string[]) {
		fetcher.submit(
			{ intent: "reorder-items", itemIds: JSON.stringify(itemIds) },
			{ method: "post" },
		);
	}

	return { reorderItems };
}

export function useSetAllItemsStatus() {
	const fetcher = useFetcher();

	function setAllItemsStatus(status: ItemStatus) {
		fetcher.submit({ intent: "set-all-status", status }, { method: "post" });
	}

	return { setAllItemsStatus, isSubmitting: fetcher.state !== "idle" };
}

export function useSortItemsByName() {
	const fetcher = useFetcher();

	function sortItemsByName(direction: ItemSortDirection) {
		fetcher.submit({ intent: "sort-items", direction }, { method: "post" });
	}

	return { sortItemsByName, isSubmitting: fetcher.state !== "idle" };
}
