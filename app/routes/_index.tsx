import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { redirect } from "react-router";

import {
	createShoppingList,
	DeleteListDialog,
	deleteShoppingList,
	EMPTY_STORAGE,
	getShoppingLists,
	ListCard,
	ListFormDialog,
	type ShoppingList,
	shoppingListFormSchema,
	updateShoppingList,
	useDeleteShoppingList,
} from "~/domains/shopping-lists";
import { Plus } from "~/shared/components/icons";
import { Logo } from "~/shared/components/logo";
import { ModeToggle } from "~/shared/components/mode-toggle";
import { Button } from "~/shared/components/ui/button";
import { readStorage, writeStorage } from "~/shared/lib/storage";

import type { Route } from "./+types/_index";

export function meta() {
	return [{ title: "Listify — Suas listas" }];
}

export async function clientLoader() {
	const storage = readStorage(EMPTY_STORAGE);
	return { lists: getShoppingLists(storage) };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
	const storage = readStorage(EMPTY_STORAGE);
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "create-list": {
			const submission = parseWithZod(formData, {
				schema: shoppingListFormSchema,
			});
			if (submission.status !== "success") return submission.reply();

			const { storage: next, list } = createShoppingList(
				storage,
				submission.value.name,
				submission.value.budget,
			);
			writeStorage(next);
			return redirect(`/lists/${list.id}`);
		}
		case "update-list": {
			const submission = parseWithZod(formData, {
				schema: shoppingListFormSchema,
			});
			if (submission.status !== "success") return submission.reply();

			const id = String(formData.get("id") ?? "");
			const next = id
				? updateShoppingList(storage, id, submission.value)
				: storage;
			writeStorage(next);
			return submission.reply();
		}
		case "delete-list": {
			const id = String(formData.get("id") ?? "");
			const next = id ? deleteShoppingList(storage, id) : storage;
			writeStorage(next);
			return null;
		}
		default:
			return null;
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { lists } = loaderData;
	const { deleteShoppingList: deleteList } = useDeleteShoppingList();

	const [isCreateOpen, setCreateOpen] = useState(false);
	const [editingList, setEditingList] = useState<ShoppingList | null>(null);
	const [deletingList, setDeletingList] = useState<ShoppingList | null>(null);

	return (
		<div className="container-wrapper">
			<div className="mb-8 flex items-center justify-between sm:mb-11">
				<Logo />
				<ModeToggle />
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
					<Plus />
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
			/>

			{editingList && (
				<ListFormDialog
					key={editingList.id}
					open
					onOpenChange={(open) => !open && setEditingList(null)}
					mode="edit"
					listId={editingList.id}
					initialName={editingList.name}
					initialBudget={editingList.budget}
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
