import { useFetcher } from "react-router";
import type { ItemPlacement } from "~/domains/shopping-list-items/services/shopping-groups-service";

// Criar/renomear grupo são conduzidos pelo próprio `GroupFormDialog` via
// `fetcher.Form` (mesmo padrão de `ListFormDialog`/`ItemFormDrawer`), não por
// hooks imperativos — não há um hook `useCreateGroup`/`useRenameGroup` aqui
// por esse motivo.

export function useDeleteGroup() {
	const fetcher = useFetcher();

	function deleteGroup(groupId: string) {
		fetcher.submit({ intent: "delete-group", groupId }, { method: "post" });
	}

	return { deleteGroup };
}

export function useToggleGroupCollapsed() {
	const fetcher = useFetcher();

	function toggleGroupCollapsed(groupId: string) {
		fetcher.submit(
			{ intent: "toggle-group-collapsed", groupId },
			{ method: "post" },
		);
	}

	return { toggleGroupCollapsed };
}

export function useMoveItems() {
	const fetcher = useFetcher();

	function moveItems(placements: ItemPlacement[]) {
		fetcher.submit(
			{ intent: "move-items", placements: JSON.stringify(placements) },
			{ method: "post" },
		);
	}

	return { moveItems };
}
