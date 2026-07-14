import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { data, Link, redirect } from "react-router";

import {
	addItem,
	deleteItem,
	getListTotals,
	ItemFormDrawer,
	ItemSection,
	type ItemStatus,
	itemFormSchema,
	ListTotalsSummary,
	reorderItems,
	setItemStatus,
	updateItem,
	useDeleteItem,
	useReorderItems,
	useToggleItemStatus,
} from "~/domains/shopping-list-items";
import {
	// BudgetAlert,
	DeleteListDialog,
	deleteShoppingList,
	EMPTY_STORAGE,
	getShoppingListById,
	ListFormDialog,
	shoppingListFormSchema,
	updateShoppingList,
	useDeleteShoppingList,
} from "~/domains/shopping-lists";
import { getBudgetStatus } from "~/domains/shopping-lists/utils/budget-status";
import {
	ChevronLeft,
	DotIcon,
	MoreVertical,
	Pencil,
	Plus,
	Trash2,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { readStorage, serializeStorage } from "~/shared/lib/storage.server";
import { cn, formatCurrency } from "~/shared/lib/utils";
import type { Route } from "./+types/lists.$listId";

export function meta({ loaderData }: Route.MetaArgs) {
	return [
		{ title: loaderData ? `Listify — ${loaderData.list.name}` : "Listify" },
	];
}

export async function loader({ request, params }: Route.LoaderArgs) {
	const storage = await readStorage(request, EMPTY_STORAGE);
	const list = getShoppingListById(storage, params.listId);
	if (!list) throw new Response("Lista não encontrada", { status: 404 });
	return { list };
}

export async function action({ request, params }: Route.ActionArgs) {
	const listId = params.listId;
	const storage = await readStorage(request, EMPTY_STORAGE);
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "update-list": {
			const submission = parseWithZod(formData, {
				schema: shoppingListFormSchema,
			});
			if (submission.status !== "success") return submission.reply();

			const next = updateShoppingList(storage, listId, submission.value);
			const headers = new Headers({
				"Set-Cookie": await serializeStorage(next),
			});
			return data(submission.reply(), { headers });
		}
		case "delete-list": {
			const next = deleteShoppingList(storage, listId);
			const headers = new Headers({
				"Set-Cookie": await serializeStorage(next),
			});
			return redirect("/", { headers });
		}
		case "add-item": {
			const submission = parseWithZod(formData, { schema: itemFormSchema });
			if (submission.status !== "success") return submission.reply();

			const { storage: next } = addItem(storage, listId, submission.value);
			const headers = new Headers({
				"Set-Cookie": await serializeStorage(next),
			});
			return data(submission.reply({ resetForm: true }), { headers });
		}
		case "edit-item": {
			const submission = parseWithZod(formData, { schema: itemFormSchema });
			if (submission.status !== "success") return submission.reply();

			const itemId = String(formData.get("itemId") ?? "");
			const next = updateItem(storage, listId, itemId, submission.value);
			const headers = new Headers({
				"Set-Cookie": await serializeStorage(next),
			});
			return data(submission.reply(), { headers });
		}
		case "delete-item": {
			const itemId = String(formData.get("itemId") ?? "");
			const next = deleteItem(storage, listId, itemId);
			const headers = new Headers({
				"Set-Cookie": await serializeStorage(next),
			});
			return data(null, { headers });
		}
		case "toggle-status": {
			const itemId = String(formData.get("itemId") ?? "");
			const status = String(
				formData.get("status") ?? "unchecked",
			) as ItemStatus;
			const next = setItemStatus(storage, listId, itemId, status);
			const headers = new Headers({
				"Set-Cookie": await serializeStorage(next),
			});
			return data(null, { headers });
		}
		case "reorder-items": {
			const itemIds = JSON.parse(
				String(formData.get("itemIds") ?? "[]"),
			) as string[];
			const next = reorderItems(storage, listId, itemIds);
			const headers = new Headers({
				"Set-Cookie": await serializeStorage(next),
			});
			return data(null, { headers });
		}
		default:
			return null;
	}
}

export default function ListDetail({ loaderData }: Route.ComponentProps) {
	const { list } = loaderData;

	const { deleteItem: submitDeleteItem } = useDeleteItem();
	const { setItemStatus: submitStatus } = useToggleItemStatus();
	const { reorderItems: submitReorder } = useReorderItems();
	const { deleteShoppingList: deleteList } = useDeleteShoppingList();

	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);
	const [isAddOpen, setAddOpen] = useState(false);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [editFocusField, setEditFocusField] = useState<"price" | undefined>(
		undefined,
	);

	function handleEditItem(itemId: string, focusField?: "price") {
		setEditingItemId(itemId);
		setEditFocusField(focusField);
	}

	const sortedItems = [...list.items].sort((a, b) => a.order - b.order);
	const uncheckedItems = sortedItems.filter(
		(item) => item.status === "unchecked",
	);
	const checkedItems = sortedItems.filter((item) => item.status === "checked");
	const homeItems = sortedItems.filter(
		(item) => item.status === "have_at_home",
	);

	const editingItem = editingItemId
		? (list.items.find((item) => item.id === editingItemId) ?? null)
		: null;

	const { estimatedTotal } = getListTotals(list.items || []);
	const budgetStatus = getBudgetStatus(estimatedTotal, list.budget ?? 0);

	return (
		<div className="container-wrapper">
			<div className="mb-6 flex items-center gap-2.5 sm:mb-7 sm:gap-3.5">
				<Link
					to="/"
					className="flex size-8 shrink-0 items-center justify-center rounded-md border text-foreground hover:bg-muted"
					aria-label="Voltar para suas listas"
				>
					<ChevronLeft className="size-4" />
				</Link>

				<button
					type="button"
					onClick={() => setEditOpen(true)}
					className="min-w-0 flex-1 text-left"
				>
					<h1 className="truncate font-bold text-xl tracking-tight sm:text-2xl">
						{list.name}
					</h1>
					<div className="mt-0.5 flex items-center gap-0.5 text-muted-foreground text-xs">
						<p>
							{list.items.length} {list.items.length === 1 ? "item" : "itens"}
						</p>
						{list.budget && list.budget > 0 && (
							<>
								<DotIcon className="size-4 shrink-0" />
								<p>
									Orçamento:{" "}
									<span
										className={cn("text-foreground", {
											"text-destructive": budgetStatus === "over",
										})}
									>
										{formatCurrency(list.budget)}
									</span>
								</p>
							</>
						)}
					</div>
				</button>

				<DropdownMenu>
					<DropdownMenuTrigger className="flex size-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted">
						<MoreVertical className="size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setEditOpen(true)}>
							<Pencil className="size-3.5" />
							Editar lista
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setDeleteOpen(true)}
							variant="destructive"
						>
							<Trash2 className="size-3.5" />
							Excluir lista
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<ListTotalsSummary items={list.items} />
			{/* <BudgetAlert budget={list.budget} items={list.items} /> */}

			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-lg tracking-tight">Itens</h2>
				<Button onClick={() => setAddOpen(true)}>
					<Plus className="size-4" />
					Adicionar item
				</Button>
			</div>

			{list.items.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed py-12 text-muted-foreground sm:py-16">
					<span className="font-semibold text-foreground/70 text-sm">
						Nenhum item ainda
					</span>
					<span className="text-xs">Adicione o primeiro item dessa lista.</span>
				</div>
			) : (
				<>
					<ItemSection
						status="unchecked"
						items={uncheckedItems}
						sortable
						onReorder={(itemIds) => submitReorder(itemIds)}
						onStatusChange={(itemId, status) => submitStatus(itemId, status)}
						onEditItem={handleEditItem}
					/>
					<ItemSection
						status="checked"
						items={checkedItems}
						onStatusChange={(itemId, status) => submitStatus(itemId, status)}
						onEditItem={handleEditItem}
					/>
					<ItemSection
						status="have_at_home"
						items={homeItems}
						onStatusChange={(itemId, status) => submitStatus(itemId, status)}
						onEditItem={handleEditItem}
					/>
				</>
			)}

			<ItemFormDrawer
				open={isAddOpen}
				onOpenChange={setAddOpen}
				mode="add"
				listName={list.name}
			/>

			{editingItem && (
				<ItemFormDrawer
					key={editingItem.id}
					open
					onOpenChange={(open) => {
						if (!open) {
							setEditingItemId(null);
							setEditFocusField(undefined);
						}
					}}
					mode="edit"
					listName={list.name}
					itemId={editingItem.id}
					initialValues={editingItem}
					focusField={editFocusField}
					onDelete={() => {
						submitDeleteItem(editingItem.id);
						setEditingItemId(null);
					}}
				/>
			)}

			{isEditOpen && (
				<ListFormDialog
					open={isEditOpen}
					onOpenChange={setEditOpen}
					mode="edit"
					listId={list.id}
					initialName={list.name}
					initialBudget={list.budget}
				/>
			)}

			<DeleteListDialog
				open={isDeleteOpen}
				onOpenChange={setDeleteOpen}
				listName={list.name}
				onConfirm={() => deleteList(list.id)}
			/>
		</div>
	);
}
