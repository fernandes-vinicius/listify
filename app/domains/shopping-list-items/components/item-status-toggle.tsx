import type { ItemStatus } from "~/domains/shopping-list-items/types/item-types";
import { Check, Home } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

const NEXT_STATUS: Record<ItemStatus, ItemStatus> = {
	unchecked: "checked",
	checked: "have_at_home",
	have_at_home: "unchecked",
};

const LABEL_BY_STATUS: Record<ItemStatus, string> = {
	unchecked: "Marcar como comprado",
	checked: "Marcar como tenho em casa",
	have_at_home: "Marcar como pendente",
};

interface ItemStatusToggleProps {
	status: ItemStatus;
	onChange: (next: ItemStatus) => void;
	disabled?: boolean;
}

export function ItemStatusToggle({
	status,
	onChange,
	disabled,
}: ItemStatusToggleProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={(event) => {
				event.stopPropagation();
				onChange(NEXT_STATUS[status]);
			}}
			aria-label={LABEL_BY_STATUS[status]}
			className={cn(
				"flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:opacity-50",
				status === "unchecked" && "border-muted-foreground/30 bg-background",
				status === "checked" &&
					"border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500",
				status === "have_at_home" &&
					"border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
			)}
		>
			{status === "checked" && <Check className="size-3.5" strokeWidth={3} />}
			{status === "have_at_home" && (
				<Home className="size-3.5" strokeWidth={2.4} />
			)}
		</button>
	);
}
