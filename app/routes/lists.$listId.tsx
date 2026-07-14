import { DotIcon } from "lucide-react";
import { useState } from "react";
import { Link, redirect } from "react-router";
import {
	addItem,
	deleteItem,
	getListTotals,
	ItemFormDrawer,
	ItemSection,
	type ItemStatus,
	ListTotalsSummary,
	reorderItems,
	setItemStatus,
	updateItem,
	useAddItem,
	useDeleteItem,
	useReorderItems,
	useToggleItemStatus,
	useUpdateItem,
} from "~/domains/shopping-list-items";
import {
	BudgetAlert,
	DeleteListDialog,
	deleteShoppingList,
	getShoppingListById,
	ListFormDialog,
	updateShoppingList,
	useDeleteShoppingList,
	useUpdateShoppingList,
} from "~/domains/shopping-lists";
import { getBudgetStatus } from "~/domains/shopping-lists/utils/budget-status";
import {
	ChevronLeft,
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
import { cn, formatCurrency } from "~/shared/lib/utils";
import type { Route } from "./+types/lists.$listId";

export function meta({ loaderData }: Route.MetaArgs) {
	return [
		{ title: loaderData ? `Listify — ${loaderData.list.name}` : "Listify" },
	];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const list = getShoppingListById(params.listId);
	if (!list) throw new Response("Lista não encontrada", { status: 404 });
	return { list };
}

function parseBudget(formData: FormData): number | null {
	const raw = String(formData.get("budget") ?? "");
	if (!raw) return null;
	const value = Number(raw);
	return Number.isFinite(value) && value > 0 ? value : null;
}

export async function clientAction({
	request,
	params,
}: Route.ClientActionArgs) {
	const listId = params.listId;
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "update-list": {
			const name = String(formData.get("name") ?? "").trim();
			if (name)
				updateShoppingList(listId, { name, budget: parseBudget(formData) });
			return null;
		}
		case "delete-list": {
			deleteShoppingList(listId);
			return redirect("/");
		}
		case "add-item": {
			addItem(listId, {
				name: String(formData.get("name") ?? ""),
				quantity: Number(formData.get("quantity") ?? 0),
				unit: String(formData.get("unit") ?? ""),
				price: Number(formData.get("price") ?? 0),
			});
			return null;
		}
		case "edit-item": {
			const itemId = String(formData.get("itemId") ?? "");
			updateItem(listId, itemId, {
				name: String(formData.get("name") ?? ""),
				quantity: Number(formData.get("quantity") ?? 0),
				unit: String(formData.get("unit") ?? ""),
				price: Number(formData.get("price") ?? 0),
				status: String(formData.get("status") ?? "unchecked") as ItemStatus,
			});
			return null;
		}
		case "delete-item": {
			deleteItem(listId, String(formData.get("itemId") ?? ""));
			return null;
		}
		case "toggle-status": {
			setItemStatus(
				listId,
				String(formData.get("itemId") ?? ""),
				String(formData.get("status") ?? "unchecked") as ItemStatus,
			);
			return null;
		}
		case "reorder-items": {
			const itemIds = JSON.parse(
				String(formData.get("itemIds") ?? "[]"),
			) as string[];
			reorderItems(listId, itemIds);
			return null;
		}
		default:
			return null;
	}
}

export default function ListDetail({ loaderData }: Route.ComponentProps) {
	const { list } = loaderData;

	const { addItem: submitAddItem } = useAddItem();
	const { updateItem: submitUpdateItem } = useUpdateItem();
	const { deleteItem: submitDeleteItem } = useDeleteItem();
	const { setItemStatus: submitStatus } = useToggleItemStatus();
	const { reorderItems: submitReorder } = useReorderItems();
	const { updateShoppingList: updateList } = useUpdateShoppingList();
	const { deleteShoppingList: deleteList } = useDeleteShoppingList();

	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);
	const [isAddOpen, setAddOpen] = useState(false);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);

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
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 md:py-14">
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
			<BudgetAlert budget={list.budget} items={list.items} />

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
						onEditItem={(itemId) => setEditingItemId(itemId)}
					/>
					<ItemSection
						status="checked"
						items={checkedItems}
						onStatusChange={(itemId, status) => submitStatus(itemId, status)}
						onEditItem={(itemId) => setEditingItemId(itemId)}
					/>
					<ItemSection
						status="have_at_home"
						items={homeItems}
						onStatusChange={(itemId, status) => submitStatus(itemId, status)}
						onEditItem={(itemId) => setEditingItemId(itemId)}
					/>
				</>
			)}

			<ItemFormDrawer
				open={isAddOpen}
				onOpenChange={setAddOpen}
				mode="add"
				listName={list.name}
				onSubmit={(values) => submitAddItem(values)}
			/>

			{editingItem && (
				<ItemFormDrawer
					key={editingItem.id}
					open
					onOpenChange={(open) => !open && setEditingItemId(null)}
					mode="edit"
					listName={list.name}
					initialValues={editingItem}
					onSubmit={(values) => submitUpdateItem(editingItem.id, values)}
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
					initialName={list.name}
					initialBudget={list.budget}
					onSubmit={(name, budget) => updateList(list.id, name, budget)}
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
