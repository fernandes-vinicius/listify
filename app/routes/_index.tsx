import { useState } from "react";
import { redirect } from "react-router";

import {
	createShoppingList,
	DeleteListDialog,
	deleteShoppingList,
	getShoppingLists,
	ListCard,
	ListFormDialog,
	type ShoppingList,
	updateShoppingList,
	useCreateShoppingList,
	useDeleteShoppingList,
	useUpdateShoppingList,
} from "~/domains/shopping-lists";
import { Plus, ShoppingBasket } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

import type { Route } from "./+types/_index";

export function meta() {
	return [{ title: "Listify — Suas listas" }];
}

export async function clientLoader() {
	return { lists: getShoppingLists() };
}

function parseBudget(formData: FormData): number | null {
	const raw = String(formData.get("budget") ?? "");
	if (!raw) return null;
	const value = Number(raw);
	return Number.isFinite(value) && value > 0 ? value : null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "create-list": {
			const name = String(formData.get("name") ?? "").trim();
			if (!name) return null;
			const list = createShoppingList(name, parseBudget(formData));
			return redirect(`/lists/${list.id}`);
		}
		case "update-list": {
			const id = String(formData.get("id") ?? "");
			const name = String(formData.get("name") ?? "").trim();
			if (id && name) {
				updateShoppingList(id, { name, budget: parseBudget(formData) });
			}
			return null;
		}
		case "delete-list": {
			const id = String(formData.get("id") ?? "");
			if (id) deleteShoppingList(id);
			return null;
		}
		default:
			return null;
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { lists } = loaderData;
	const createList = useCreateShoppingList();
	const { updateShoppingList: updateList } = useUpdateShoppingList();
	const { deleteShoppingList: deleteList } = useDeleteShoppingList();

	const [isCreateOpen, setCreateOpen] = useState(false);
	const [editingList, setEditingList] = useState<ShoppingList | null>(null);
	const [deletingList, setDeletingList] = useState<ShoppingList | null>(null);

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:py-14">
			<div className="mb-8 flex items-center gap-2.5 font-bold text-lg tracking-tight sm:mb-11">
				<span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
					<ShoppingBasket className="size-4" />
				</span>
				Listify
			</div>

			<div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
						Suas listas
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						{lists.length === 0
							? "Nenhuma lista de compras ainda"
							: `${lists.length} ${lists.length === 1 ? "lista" : "listas"} de compras`}
					</p>
				</div>
				<Button
					onClick={() => setCreateOpen(true)}
					className="w-full sm:w-auto"
				>
					<Plus className="size-4" />
					Criar nova lista
				</Button>
			</div>

			{lists.length === 0 ? (
				<button
					type="button"
					onClick={() => setCreateOpen(true)}
					className="flex w-full flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed py-12 text-muted-foreground hover:bg-muted/30 sm:py-16"
				>
					<span className="flex size-9 items-center justify-center rounded-full border border-dashed">
						<Plus className="size-4" />
					</span>
					<span className="font-semibold text-foreground/70 text-sm">
						Criar minha primeira lista
					</span>
				</button>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
					{lists.map((list) => (
						<ListCard
							key={list.id}
							list={list}
							onRename={() => setEditingList(list)}
							onDelete={() => setDeletingList(list)}
						/>
					))}
				</div>
			)}

			<ListFormDialog
				open={isCreateOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				onSubmit={(name, budget) => createList(name, budget)}
			/>

			{editingList && (
				<ListFormDialog
					key={editingList.id}
					open
					onOpenChange={(open) => !open && setEditingList(null)}
					mode="edit"
					initialName={editingList.name}
					initialBudget={editingList.budget}
					onSubmit={(name, budget) => updateList(editingList.id, name, budget)}
				/>
			)}

			{deletingList && (
				<DeleteListDialog
					key={deletingList.id}
					open
					onOpenChange={(open) => !open && setDeletingList(null)}
					listName={deletingList.name}
					onConfirm={() => {
						deleteList(deletingList.id);
						setDeletingList(null);
					}}
				/>
			)}
		</div>
	);
}
