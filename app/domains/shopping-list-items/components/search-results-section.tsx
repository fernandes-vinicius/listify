import { ItemRow } from "~/domains/shopping-list-items/components/item-row";
import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";

interface SearchResultsSectionProps {
	query: string;
	items: ShoppingItem[];
	onStatusChange: (itemId: string, status: ItemStatus) => void;
	onEditItem: (itemId: string, editTarget?: "price") => void;
	onDeleteItem: (itemId: string) => void;
}

export function SearchResultsSection({
	query,
	items,
	onStatusChange,
	onEditItem,
	onDeleteItem,
}: SearchResultsSectionProps) {
	return (
		<section className="mb-5">
			<div className="mb-2.5 flex items-center gap-2 px-0.5">
				<h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wide">
					Resultados da busca
				</h3>
				<span className="font-semibold text-muted-foreground/60 text-xs">
					· {items.length}
				</span>
			</div>

			{items.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed py-10 text-muted-foreground">
					<span className="font-semibold text-foreground/70 text-sm">
						Nenhum item encontrado
					</span>
					<span className="text-xs">Nenhum item bate com "{query}".</span>
				</div>
			) : (
				<div className="overflow-hidden rounded-lg border bg-card">
					{items.map((item) => (
						<ItemRow
							key={item.id}
							item={item}
							onStatusChange={(status) => onStatusChange(item.id, status)}
							onEdit={(editTarget) => onEditItem(item.id, editTarget)}
							onDelete={() => onDeleteItem(item.id)}
						/>
					))}
				</div>
			)}
		</section>
	);
}
