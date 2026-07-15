import { ShoppingBasket } from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

export function Logo({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex items-center gap-2.5 font-bold text-lg tracking-tight",
				className,
			)}
			{...props}
		>
			<span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
				<ShoppingBasket className="size-4" />
			</span>
			Listify.
		</div>
	);
}
