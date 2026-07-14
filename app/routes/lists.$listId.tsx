import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { Link, redirect } from "react-router";

import {
	addItem,
	deleteItem,
	getListTotals,
	ItemFormDrawer,
	ItemPriceEditDrawer,
	ItemSection,
	type ItemStatus,
	itemFormSchema,
	ListTotalsSummary,
	reorderItems,
	setAllItemsStatus,
	setItemStatus,
	sortItemsByName,
	updateItem,
	useDeleteItem,
	useReorderItems,
	useSetAllItemsStatus,
	useSortItemsByName,
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
	ArrowDownAZ,
	ArrowDownZA,
	ArrowUpDown,
	Check,
	ChevronLeft,
	Circle,
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { readStorage, writeStorage } from "~/shared/lib/storage";
import { cn, formatCurrency } from "~/shared/lib/utils";
import type { Route } from "./+types/lists.$listId";

export function meta({ loaderData }: Route.MetaArgs) {
	return [
		{ title: loaderData ? `Listify — ${loaderData.list.name}` : "Listify" },
	];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const storage = readStorage(EMPTY_STORAGE);
	const list = getShoppingListById(storage, params.listId);
	if (!list) throw new Response("Lista não encontrada", { status: 404 });
	return { list };
}

export async function clientAction({
	request,
	params,
}: Route.ClientActionArgs) {
	const listId = params.listId;
	const storage = readStorage(EMPTY_STORAGE);
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "update-list": {
			const submission = parseWithZod(formData, {
				schema: shoppingListFormSchema,
			});
			if (submission.status !== "success") return submission.reply();

			const next = updateShoppingList(storage, listId, submission.value);
			writeStorage(next);
			return submission.reply();
		}
		case "delete-list": {
			const next = deleteShoppingList(storage, listId);
			writeStorage(next);
			return redirect("/");
		}
		case "add-item": {
			const submission = parseWithZod(formData, { schema: itemFormSchema });
			if (submission.status !== "success") return submission.reply();

			const { storage: next } = addItem(storage, listId, submission.value);
			writeStorage(next);
			return submission.reply({ resetForm: true });
		}
		case "edit-item": {
			const submission = parseWithZod(formData, { schema: itemFormSchema });
			if (submission.status !== "success") return submission.reply();

			const itemId = String(formData.get("itemId") ?? "");
			const next = updateItem(storage, listId, itemId, submission.value);
			writeStorage(next);
			return submission.reply();
		}
		case "delete-item": {
			const itemId = String(formData.get("itemId") ?? "");
			const next = deleteItem(storage, listId, itemId);
			writeStorage(next);
			return null;
		}
		case "toggle-status": {
			const itemId = String(formData.get("itemId") ?? "");
			const status = String(
				formData.get("status") ?? "unchecked",
			) as ItemStatus;
			const next = setItemStatus(storage, listId, itemId, status);
			writeStorage(next);
			return null;
		}
		case "reorder-items": {
			const itemIds = JSON.parse(
				String(formData.get("itemIds") ?? "[]"),
			) as string[];
			const next = reorderItems(storage, listId, itemIds);
			writeStorage(next);
			return null;
		}
		case "set-all-status": {
			const status = String(
				formData.get("status") ?? "unchecked",
			) as ItemStatus;
			const next = setAllItemsStatus(storage, listId, status);
			writeStorage(next);
			return null;
		}
		case "sort-items": {
			const direction = formData.get("direction") === "desc" ? "desc" : "asc";
			const next = sortItemsByName(storage, listId, direction);
			writeStorage(next);
			return null;
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
	const { setAllItemsStatus: submitAllStatus } = useSetAllItemsStatus();
	const { sortItemsByName: submitSort } = useSortItemsByName();
	const { deleteShoppingList: deleteList } = useDeleteShoppingList();

	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);
	const [isAddOpen, setAddOpen] = useState(false);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [editTarget, setEditTarget] = useState<"price" | undefined>(undefined);

	function handleEditItem(itemId: string, target?: "price") {
		setEditingItemId(itemId);
		setEditTarget(target);
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
				<Button
					size="icon-sm"
					variant="outline"
					className="shrink-0"
					render={
						<Link to="/" aria-label="Voltar para suas listas">
							<ChevronLeft />
						</Link>
					}
				/>

				<div className="min-w-0 flex-1 text-left">
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
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button size="icon-sm" variant="outline">
								<MoreVertical />
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							disabled={list.items.length === 0}
							onClick={() => submitAllStatus("checked")}
						>
							<Check className="size-3.5" />
							Marcar todos como comprados
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={list.items.length === 0}
							onClick={() => submitAllStatus("unchecked")}
						>
							<Circle className="size-3.5" />
							Desmarcar todos
						</DropdownMenuItem>
						<DropdownMenuSeparator />
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

			<div className="mt-6 mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-lg tracking-tight">Itens</h2>
				<div className="flex items-center gap-1.5">
					<Button onClick={() => setAddOpen(true)}>
						<Plus />
						Adicionar item
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									size="icon-sm"
									variant="outline"
									disabled={list.items.length === 0}
									aria-label="Reordenar itens"
								>
									<ArrowUpDown />
								</Button>
							}
						/>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => submitSort("asc")}>
								<ArrowDownAZ />
								Nome (A-Z)
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => submitSort("desc")}>
								<ArrowDownZA />
								Nome (Z-A)
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
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

			{editingItem &&
				(editTarget === "price" ? (
					<ItemPriceEditDrawer
						key={editingItem.id}
						open
						onOpenChange={(open) => {
							if (!open) {
								setEditingItemId(null);
								setEditTarget(undefined);
							}
						}}
						listName={list.name}
						itemId={editingItem.id}
						initialValues={editingItem}
					/>
				) : (
					<ItemFormDrawer
						key={editingItem.id}
						open
						onOpenChange={(open) => {
							if (!open) {
								setEditingItemId(null);
								setEditTarget(undefined);
							}
						}}
						mode="edit"
						listName={list.name}
						itemId={editingItem.id}
						initialValues={editingItem}
						onDelete={() => {
							submitDeleteItem(editingItem.id);
							setEditingItemId(null);
						}}
					/>
				))}

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
