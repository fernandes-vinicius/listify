import type { ItemStatus } from "~/domains/shopping-list-items/types/item-types";
import { Check, Home } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

interface StatusOptionCardProps {
	status: ItemStatus;
	label: string;
	isSelected: boolean;
	onSelect: (status: ItemStatus) => void;
}

export function StatusOptionCard({
	status,
	label,
	isSelected,
	onSelect,
}: StatusOptionCardProps) {
	return (
		<button
			type="button"
			onClick={() => onSelect(status)}
			className={cn(
				"flex flex-col items-center gap-1.5 rounded-md border-[1.5px] px-2 py-2.5 text-center transition-colors",
				!isSelected && "border-border",
				isSelected &&
					status === "unchecked" &&
					"border-muted-foreground/40 bg-muted",
				isSelected &&
					status === "checked" &&
					"border-green-600 bg-green-50 dark:bg-green-500/10",
				isSelected &&
					status === "have_at_home" &&
					"border-amber-500 bg-amber-50 dark:bg-amber-500/10",
			)}
		>
			<span
				className={cn(
					"flex size-5 items-center justify-center rounded-full border-[1.5px]",
					status === "unchecked" && "border-muted-foreground/30",
					status === "checked" &&
						"border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500",
					status === "have_at_home" &&
						"border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
				)}
			>
				{status === "checked" && <Check className="size-3" strokeWidth={3} />}
				{status === "have_at_home" && (
					<Home className="size-3" strokeWidth={2.4} />
				)}
			</span>
			<span
				className={cn(
					"font-semibold text-[11px]",
					!isSelected && "text-muted-foreground",
					isSelected && status === "unchecked" && "text-foreground",
					isSelected &&
						status === "checked" &&
						"text-green-700 dark:text-green-400",
					isSelected &&
						status === "have_at_home" &&
						"text-amber-700 dark:text-amber-400",
				)}
			>
				{label}
			</span>
		</button>
	);
}
