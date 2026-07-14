import { forwardRef, type ChangeEvent, type ComponentProps } from "react";
import { Input } from "~/shared/components/ui/input";

function centsToValue(cents: number): number {
	return cents / 100;
}

function formatCents(cents: number): string {
	return centsToValue(cents).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

interface CurrencyInputProps
	extends Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
	value: number;
	onValueChange: (value: number) => void;
}

// Máscara monetária: o usuário digita apenas dígitos e eles preenchem da
// direita pra esquerda (ex: "1" -> R$ 0,01, "123" -> R$ 1,23), como em
// qualquer campo de valor em dinheiro — evita ambiguidade de separador
// decimal e nunca deixa o campo num estado "meio digitado" inválido.
//
// Totalmente controlado pelo `value` prop (sem estado interno próprio) — um
// `cents` local ficaria dessincronizado sempre que o valor mudar por fora
// (reset de formulário, edição carregando valores iniciais etc.), já que só
// era inicializado uma vez no mount.
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
	function CurrencyInput({ value, onValueChange, ...props }, ref) {
		const cents = Math.round(value * 100);

		function handleChange(event: ChangeEvent<HTMLInputElement>) {
			const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 10);
			const nextCents = digitsOnly === "" ? 0 : Number(digitsOnly);
			onValueChange(centsToValue(nextCents));
		}

		return (
			<Input
				ref={ref}
				inputMode="numeric"
				value={formatCents(cents)}
				onChange={handleChange}
				{...props}
			/>
		);
	},
);
