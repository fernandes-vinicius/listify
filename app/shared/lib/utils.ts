import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, opts?: Intl.NumberFormatOptions) {
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
		...opts,
	});
}

export function centsToValue(cents: number) {
	return cents / 100;
}

export function formatCents(cents: number) {
	return formatCurrency(centsToValue(cents));
}
