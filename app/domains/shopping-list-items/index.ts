export type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
export {
	getItemTotal,
	getListTotals,
	type ListTotals,
} from "~/domains/shopping-list-items/utils/item-totals";

export {
	addItem,
	updateItem,
	deleteItem,
	setItemStatus,
	reorderItems,
	type ItemInput,
} from "~/domains/shopping-list-items/services/shopping-list-items-service";

export {
	useAddItem,
	useUpdateItem,
	useDeleteItem,
	useToggleItemStatus,
	useReorderItems,
	type ItemFormInput,
} from "~/domains/shopping-list-items/hooks/use-shopping-list-items";

export { ItemSection } from "~/domains/shopping-list-items/components/item-section";
export {
	ItemFormDrawer,
	type ItemFormValues,
} from "~/domains/shopping-list-items/components/item-form-drawer";
export { ListTotalsSummary } from "~/domains/shopping-list-items/components/list-totals-summary";
