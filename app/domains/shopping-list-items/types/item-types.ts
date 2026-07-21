export type ItemStatus = "unchecked" | "checked" | "have_at_home";
export type ItemSortDirection = "asc" | "desc";

export interface ShoppingItem {
	id: string;
	name: string;
	quantity: number;
	unit: string;
	price: number;
	status: ItemStatus;
	order: number;
	createdAt: string;
	// Grupo (acordeão) ao qual o item pertence dentro da seção "Pendentes";
	// null = item solto, sem agrupamento. Recurso opcional — ver ShoppingGroup.
	groupId: string | null;
}

// Agrupamento nomeado e opcional dentro de uma lista, usado só pra organizar
// a seção "Pendentes" (ver app/routes/lists.$listId.tsx). Itens marcados como
// comprados/tenho em casa saem do agrupamento visualmente mas mantêm o
// `groupId`, então voltam a aparecer no grupo se forem desmarcados.
export interface ShoppingGroup {
	id: string;
	name: string;
	order: number;
	collapsed: boolean;
}
