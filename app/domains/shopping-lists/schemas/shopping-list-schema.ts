import { z } from "zod";

// R$ 0,00 (ou vazio) é tratado como "sem orçamento definido" — o campo é
// opcional e a máscara monetária sempre parte de zero, então não faz sentido
// distinguir "zero" de "não preenchido" nesse contexto.
export const shoppingListFormSchema = z.object({
	name: z
		.string({ message: "Informe um nome para a lista" })
		.trim()
		.min(1, "Informe um nome para a lista")
		.max(80, "Nome muito longo"),
	budget: z
		.string()
		.trim()
		.optional()
		.refine((v) => !v || /^\d+([.,]\d+)?$/.test(v), "Orçamento inválido")
		.transform((v) => {
			if (!v) return null;
			const value = Number(v.replace(",", "."));
			return value > 0 ? value : null;
		}),
});

export type ShoppingListFormValues = z.infer<typeof shoppingListFormSchema>;
