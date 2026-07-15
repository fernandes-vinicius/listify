import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { useRef, useState } from "react";
import { ItemStatusToggle } from "~/domains/shopping-list-items/components/item-status-toggle";
import type {
	ItemStatus,
	ShoppingItem,
} from "~/domains/shopping-list-items/types/item-types";
import { getItemTotal } from "~/domains/shopping-list-items/utils/item-totals";
import { GripVertical, Trash2 } from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { cn, formatCurrency } from "~/shared/lib/utils";

interface ItemRowProps {
	item: ShoppingItem;
	draggable?: boolean;
	dragHandleAttributes?: DraggableAttributes;
	dragHandleListeners?: DraggableSyntheticListeners;
	onStatusChange: (status: ItemStatus) => void;
	onEdit: (editTarget?: "price") => void;
	onDelete?: () => void;
}

// Distância de arrasto (px) a partir da qual soltar o dedo remove o item.
const SWIPE_THRESHOLD = 72;
// Limite visual do arrasto enquanto o usuário ainda está arrastando.
const MAX_SWIPE = 96;
// Deslocamento usado na animação de saída, após ultrapassar o limiar.
const EXIT_SWIPE = 480;

export function ItemRow({
	item,
	draggable,
	dragHandleAttributes,
	dragHandleListeners,
	onStatusChange,
	onEdit,
	onDelete,
}: ItemRowProps) {
	const [dragX, setDragX] = useState(0);
	const [isSwiping, setIsSwiping] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const gesture = useRef<{
		startX: number;
		startY: number;
		locked: "horizontal" | "vertical" | null;
		dragged: boolean;
	} | null>(null);

	function handlePointerDown(event: React.PointerEvent) {
		if (!onDelete || isRemoving) return;
		if ((event.target as HTMLElement).closest("[data-drag-handle]")) return;
		gesture.current = {
			startX: event.clientX,
			startY: event.clientY,
			locked: null,
			dragged: false,
		};
	}

	function handlePointerMove(event: React.PointerEvent) {
		const state = gesture.current;
		if (!state) return;

		const deltaX = event.clientX - state.startX;
		const deltaY = event.clientY - state.startY;

		if (state.locked === null) {
			if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
			state.locked =
				Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
			if (state.locked === "horizontal") {
				setIsSwiping(true);
				event.currentTarget.setPointerCapture(event.pointerId);
			}
		}

		if (state.locked !== "horizontal") return;

		state.dragged = true;
		event.preventDefault();
		setDragX(Math.max(-MAX_SWIPE, Math.min(0, deltaX)));
	}

	function endGesture() {
		const state = gesture.current;
		gesture.current = null;
		if (!state || state.locked !== "horizontal") return;

		setIsSwiping(false);
		if (Math.abs(dragX) >= SWIPE_THRESHOLD) {
			setIsRemoving(true);
			setDragX(-EXIT_SWIPE);
		} else {
			setDragX(0);
		}
	}

	function handleRowClick() {
		if (gesture.current?.dragged || isRemoving) return;
		onEdit();
	}

	const progress = Math.min(1, Math.abs(dragX) / SWIPE_THRESHOLD);

	return (
		<div className="relative overflow-hidden border-b last:border-b-0">
			{onDelete && (
				<div
					className="absolute inset-0 flex items-center justify-end bg-destructive pr-5 text-destructive-foreground"
					aria-hidden="true"
				>
					<Trash2
						className="size-4 shrink-0"
						style={{
							opacity: progress,
							transform: `scale(${0.75 + progress * 0.25})`,
						}}
					/>
				</div>
			)}

			{/* biome-ignore lint/a11y/useSemanticElements: <> */}
			<div
				role="button"
				tabIndex={0}
				onClick={handleRowClick}
				onKeyDown={(event) => {
					if (event.key === "Enter") onEdit();
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={endGesture}
				onPointerCancel={endGesture}
				onTransitionEnd={(event) => {
					if (event.propertyName === "transform" && isRemoving) onDelete?.();
				}}
				style={{ transform: `translateX(${dragX}px)` }}
				className={cn(
					"flex cursor-pointer items-center gap-2 bg-card px-3 py-3 hover:bg-muted sm:gap-3.5 sm:px-4",
					onDelete && "touch-pan-y",
					!isSwiping && "transition-transform duration-200 ease-out",
					isSwiping && "select-none",
				)}
			>
				{draggable ? (
					<button
						type="button"
						data-drag-handle
						{...dragHandleAttributes}
						{...dragHandleListeners}
						onClick={(event) => event.stopPropagation()}
						className="shrink-0 cursor-grab touch-none text-muted-foreground/40 active:cursor-grabbing"
						aria-label="Arrastar para reordenar"
					>
						<GripVertical className="size-3.5" />
					</button>
				) : (
					<span className="size-3.5 shrink-0" aria-hidden="true" />
				)}

				<ItemStatusToggle status={item.status} onChange={onStatusChange} />

				<div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2.5">
					<span
						className={cn(
							"truncate font-semibold text-sm",
							item.status === "checked" &&
								"text-muted-foreground/60 line-through decoration-muted-foreground/40",
							item.status === "have_at_home" && "text-foreground/70",
						)}
					>
						{item.name}
					</span>
					<Badge
						variant="secondary"
						className="w-fit shrink-0 text-muted-foreground"
					>
						{item.quantity} {item.unit}
					</Badge>
				</div>

				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation();
						onEdit("price");
					}}
					className="flex shrink-0 items-baseline gap-2 rounded-sm sm:gap-3.5"
				>
					<span
						className={cn(
							"hidden text-right text-muted-foreground/70 text-xs sm:inline-block sm:w-14",
							item.status !== "unchecked" && "text-muted-foreground",
						)}
					>
						{formatCurrency(item.price)}
					</span>
					<span className="text-right font-medium text-sm sm:w-18">
						{formatCurrency(getItemTotal(item))}
					</span>
				</button>
			</div>
		</div>
	);
}
