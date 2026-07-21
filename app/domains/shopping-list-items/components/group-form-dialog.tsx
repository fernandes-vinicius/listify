import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useEffect } from "react";
import { useFetcher } from "react-router";

import { groupFormSchema } from "~/domains/shopping-list-items/schemas/group-schema";
import { Button } from "~/shared/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";

interface GroupFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "rename";
	groupId?: string;
	initialName?: string;
}

export function GroupFormDialog({
	open,
	onOpenChange,
	mode,
	groupId,
	initialName,
}: GroupFormDialogProps) {
	const fetcher = useFetcher();

	const [form, fields] = useForm({
		lastResult: fetcher.data,
		shouldRevalidate: "onBlur",
		defaultValue: {
			name: initialName ?? "",
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: groupFormSchema });
		},
	});

	const submitting = fetcher.state !== "idle";

	// Fecha o Sheet ao ver um `lastResult` de sucesso, igual ListFormDialog em
	// modo "edit" — aqui os dois modos (criar/renomear) fecham, já que não há
	// motivo pra manter aberto pra criar vários grupos em sequência.
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (fetcher.data && !fetcher.data.error) {
			onOpenChange(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data]);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				className="mx-auto flex w-full max-w-xl flex-col rounded-t-2xl"
			>
				<fetcher.Form
					method="post"
					{...getFormProps(form)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<input
						type="hidden"
						name="intent"
						value={mode === "create" ? "create-group" : "rename-group"}
					/>
					{mode === "rename" && (
						<input type="hidden" name="groupId" value={groupId} />
					)}

					<SheetHeader className="text-center">
						<SheetTitle>
							{mode === "create" ? "Criar grupo" : "Renomear grupo"}
						</SheetTitle>
						<SheetDescription>
							{mode === "create"
								? "Dê um nome para o grupo. Depois é só arrastar os itens pendentes pra dentro dele."
								: "Altere o nome desse grupo."}
						</SheetDescription>
					</SheetHeader>

					<FieldGroup className="overflow-y-auto p-6">
						<Field>
							<FieldLabel htmlFor={fields.name.id}>Nome</FieldLabel>
							<Input
								{...getInputProps(fields.name, { type: "text" })}
								placeholder="Ex: Hortifruti"
								autoFocus
							/>
							<FieldError>{fields.name.errors?.[0]}</FieldError>
						</Field>
					</FieldGroup>

					<SheetFooter>
						<Button type="submit" disabled={submitting}>
							{submitting
								? "Salvando…"
								: mode === "create"
									? "Criar grupo"
									: "Salvar"}
						</Button>
					</SheetFooter>
				</fetcher.Form>
			</SheetContent>
		</Sheet>
	);
}
