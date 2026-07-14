import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(
	value: number,
	opts?: Intl.NumberFormatOptions,
): string {
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
		...opts,
	});
}
