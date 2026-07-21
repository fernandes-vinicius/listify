import type { ShoppingItem } from "~/domains/shopping-list-items/types/item-types";

export function getItemTotal(
	item: Pick<ShoppingItem, "quantity" | "price">,
): number {
	return item.quantity * item.price;
}

export interface ListTotals {
	purchasedTotal: number;
	estimatedTotal: number;
	checkedCount: number;
	uncheckedCount: number;
	homeCount: number;
	progress: number;
}

// Itens "have_at_home" ficam fora dos totais e do denominador do progresso —
// esse é o diferencial do app: marcar "tenho em casa" não deve inflar o total da compra.
export function getListTotals(items: ShoppingItem[]): ListTotals {
	const checked = items.filter((item) => item.status === "checked");
	const unchecked = items.filter((item) => item.status === "unchecked");
	const home = items.filter((item) => item.status === "have_at_home");

	const purchasedTotal = checked.reduce(
		(sum, item) => sum + getItemTotal(item),
		0,
	);
	const estimatedTotal =
		purchasedTotal +
		unchecked.reduce((sum, item) => sum + getItemTotal(item), 0);

	const activeCount = checked.length + unchecked.length;
	const progress =
		activeCount === 0 ? 0 : Math.round((checked.length / activeCount) * 100);

	return {
		purchasedTotal,
		estimatedTotal,
		checkedCount: checked.length,
		uncheckedCount: unchecked.length,
		homeCount: home.length,
		progress,
	};
}

// Total de um grupo: soma todo item atribuído a ele (comprado ou pendente),
// não só os visíveis no acordeão — mesma convenção de `getListTotals`, que
// exclui itens "tenho em casa" do total.
export function getGroupTotal(items: ShoppingItem[], groupId: string): number {
	return items
		.filter(
			(item) => item.groupId === groupId && item.status !== "have_at_home",
		)
		.reduce((sum, item) => sum + getItemTotal(item), 0);
}
