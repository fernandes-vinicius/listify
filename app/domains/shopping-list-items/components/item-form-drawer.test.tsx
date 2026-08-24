import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { ShoppingGroup } from "~/domains/shopping-list-items/types/item-types";
import { ItemFormDrawer } from "./item-form-drawer";

// `useItemsSortOrder` guarda o critério de ordenação na URL via nuqs, o que
// exigiria montar todo o contexto de roteamento do nuqs só pra um detalhe
// irrelevante a este teste (o hidden input `sortOrder`) — mockado direto.
vi.mock("~/domains/shopping-list-items/hooks/use-items-sort-order", () => ({
	useItemsSortOrder: () => [null],
}));

const groups: ShoppingGroup[] = [
	{ id: "g1", name: "Laticínios", order: 0, collapsed: false },
	{ id: "g2", name: "Padaria", order: 1, collapsed: false },
];

function renderDrawer(
	props: Partial<ComponentProps<typeof ItemFormDrawer>> = {},
	onAction?: (formData: FormData) => void,
) {
	const Stub = createRoutesStub([
		{
			path: "/",
			Component: () => (
				<ItemFormDrawer
					open
					onOpenChange={() => {}}
					mode="add"
					listName="Minha lista"
					groups={groups}
					{...props}
				/>
			),
			action: async ({ request }) => {
				const formData = await request.formData();
				onAction?.(formData);
				return null;
			},
		},
	]);

	return render(<Stub initialEntries={["/"]} />);
}

describe("ItemFormDrawer — grupo no modo adicionar", () => {
	it("mostra o seletor de grupo no modo adicionar quando a lista tem grupos", () => {
		renderDrawer();

		expect(screen.getByText("Grupo (opcional)")).toBeInTheDocument();
	});

	it("não mostra o seletor quando a lista não tem grupos", () => {
		renderDrawer({ groups: [] });

		expect(screen.queryByText("Grupo (opcional)")).not.toBeInTheDocument();
	});

	it("envia groupId=none por padrão quando nenhum grupo é escolhido", async () => {
		const onAction = vi.fn();
		const user = userEvent.setup();
		renderDrawer({}, onAction);

		await user.type(screen.getByLabelText("Nome"), "Leite");
		await user.click(screen.getByRole("button", { name: /adicionar item/i }));

		await vi.waitFor(() => expect(onAction).toHaveBeenCalled());
		const formData = onAction.mock.calls[0]?.[0] as FormData;
		expect(formData.get("groupId")).toBe("none");
	});

	it("envia o groupId do grupo selecionado no seletor", async () => {
		const onAction = vi.fn();
		const user = userEvent.setup();
		renderDrawer({}, onAction);

		await user.type(screen.getByLabelText("Nome"), "Pão de forma");
		await user.click(screen.getByRole("combobox"));
		await user.click(await screen.findByRole("option", { name: "Padaria" }));
		await user.click(screen.getByRole("button", { name: /adicionar item/i }));

		await vi.waitFor(() => expect(onAction).toHaveBeenCalled());
		const formData = onAction.mock.calls[0]?.[0] as FormData;
		expect(formData.get("groupId")).toBe("g2");
	});
});
