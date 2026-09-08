import { Search, X } from "~/shared/components/icons";
import { Input } from "~/shared/components/ui/input";
import { cn } from "~/shared/lib/utils";

interface ItemSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function ItemSearchInput({
	value,
	onChange,
	className,
}: ItemSearchInputProps) {
	return (
		<div className={cn("relative", className)}>
			<Search
				className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
				aria-hidden="true"
			/>
			<Input
				type="text"
				inputMode="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Buscar item por nome..."
				aria-label="Buscar item por nome"
				className="pr-9 pl-9"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Limpar busca"
					className="-translate-y-1/2 absolute top-1/2 right-2.5 flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
				>
					<X className="size-3.5" />
				</button>
			)}
		</div>
	);
}
