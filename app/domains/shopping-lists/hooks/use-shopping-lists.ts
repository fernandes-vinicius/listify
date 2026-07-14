import { useFetcher, useSubmit } from "react-router";

// Cada rota que usa esses hooks (home e detalhe da lista) implementa o mesmo
// conjunto de intents de lista no seu próprio clientAction. Submeter sem
// `action` explícito manda para a rota atual — submeter para "/" a partir de
// outra rota mira o layout "root" (sem clientAction) por causa da ambiguidade
// entre rota index e layout no React Router.

export function useCreateShoppingList() {
	const submit = useSubmit();

	return function createShoppingList(name: string, budget: number | null) {
		submit(
			{
				intent: "create-list",
				name,
				budget: budget == null ? "" : String(budget),
			},
			{ method: "post" },
		);
	};
}

export function useUpdateShoppingList() {
	const fetcher = useFetcher();

	return {
		updateShoppingList: (id: string, name: string, budget: number | null) =>
			fetcher.submit(
				{
					intent: "update-list",
					id,
					name,
					budget: budget == null ? "" : String(budget),
				},
				{ method: "post" },
			),
		isUpdating: fetcher.state !== "idle",
	};
}

export function useDeleteShoppingList() {
	const fetcher = useFetcher();

	return {
		deleteShoppingList: (id: string) =>
			fetcher.submit({ intent: "delete-list", id }, { method: "post" }),
		isDeleting: fetcher.state !== "idle",
	};
}
