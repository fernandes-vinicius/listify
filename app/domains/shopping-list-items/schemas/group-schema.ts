import { z } from "zod";

export const groupFormSchema = z.object({
	name: z
		.string({ message: "Informe um nome para o grupo" })
		.trim()
		.min(1, "Informe um nome para o grupo")
		.max(60, "Nome muito longo"),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;
