import { useFetcher } from "react-router";
import type { ItemStatus } from "~/domains/shopping-list-items/types/item-types";

export interface ItemFormInput {
	name: string;
	quantity: number;
	unit: string;
	price: number;
}

export function useAddItem() {
	const fetcher = useFetcher();

	function addItem(input: ItemFormInput) {
		fetcher.submit(
			{
				intent: "add-item",
				name: input.name,
				quantity: String(input.quantity),
				unit: input.unit,
				price: String(input.price),
			},
			{ method: "post" },
		);
	}

	return { addItem, isSubmitting: fetcher.state !== "idle" };
}

export function useUpdateItem() {
	const fetcher = useFetcher();

	function updateItem(
		itemId: string,
		input: ItemFormInput & { status: ItemStatus },
	) {
		fetcher.submit(
			{
				intent: "edit-item",
				itemId,
				name: input.name,
				quantity: String(input.quantity),
				unit: input.unit,
				price: String(input.price),
				status: input.status,
			},
			{ method: "post" },
		);
	}

	return { updateItem, isSubmitting: fetcher.state !== "idle" };
}

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
