import { z } from "zod";

const ITEM_STATUSES = ["unchecked", "checked", "have_at_home"] as const;

const decimalString = (message: string) =>
	z
		.string({ message })
		.trim()
		.refine((v) => /^\d+([.,]\d+)?$/.test(v), message)
		.transform((v) => Number(v.replace(",", ".")));

// Um único schema serve tanto "adicionar" quanto "editar" item — o form
// sempre inclui um input hidden de `status` (mesmo no modo "adicionar", onde
// o seletor de status não é exibido), então o campo está sempre presente no
// FormData e não precisa ser opcional/derivado por modo.
export const itemFormSchema = z.object({
	name: z
		.string({ message: "Informe o nome do item" })
		.trim()
		.min(1, "Informe o nome do item")
		.max(120, "Nome muito longo"),
	quantity: decimalString("Quantidade inválida").refine(
		(v) => v > 0,
		"Quantidade deve ser maior que zero",
	),
	unit: z
		.string()
		.trim()
		.max(20, "Unidade muito longa")
		.optional()
		.transform((v) => v ?? ""),
	price: decimalString("Preço inválido").refine(
		(v) => v >= 0,
		"Preço não pode ser negativo",
	),
	status: z.enum(ITEM_STATUSES),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
