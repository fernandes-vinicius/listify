export type ItemStatus = "unchecked" | "checked" | "have_at_home";

export interface ShoppingItem {
	id: string;
	name: string;
	quantity: number;
	unit: string;
	price: number;
	status: ItemStatus;
	order: number;
	createdAt: string;
}
