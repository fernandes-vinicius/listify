import { useFetcher } from "react-router";

// Cada rota que usa esse hook (home e detalhe da lista) implementa o mesmo
// conjunto de intents de lista no seu próprio clientAction. Submeter sem
// `action` explícito manda para a rota atual — submeter para "/" a partir de
// outra rota mira o layout "root" (sem clientAction) por causa da ambiguidade
// entre rota index e layout no React Router.
//
// Criação e edição de lista são conduzidas pelo próprio `ListFormDialog` via
// `fetcher.Form` + Conform (ver list-form-dialog.tsx), não por hooks
// imperativos — Conform precisa que o form real submeta para receber de volta
// o `lastResult` (erros de validação) no `fetcher.data`.

export function useDeleteShoppingList() {
	const fetcher = useFetcher();

	return {
		deleteShoppingList: (id: string) =>
			fetcher.submit({ intent: "delete-list", id }, { method: "post" }),
		isDeleting: fetcher.state !== "idle",
	};
}
