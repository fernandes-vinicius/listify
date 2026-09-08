import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ShoppingItem } from "~/domains/shopping-list-items/types/item-types";
import { SearchResultsSection } from "./search-results-section";

function makeItem(overrides: Partial<ShoppingItem>): ShoppingItem {
	return {
		id: "item-1",
		name: "Arroz",
		quantity: 1,
		unit: "kg",
		price: 5,
		status: "unchecked",
		order: 0,
		createdAt: new Date().toISOString(),
		groupId: null,
		...overrides,
	};
}

describe("SearchResultsSection", () => {
	it("mostra estado vazio com a busca digitada quando não há resultados", () => {
		render(
			<SearchResultsSection
				query="chocolate"
				items={[]}
				onStatusChange={vi.fn()}
				onEditItem={vi.fn()}
				onDeleteItem={vi.fn()}
			/>,
		);

		expect(screen.getByText("Nenhum item encontrado")).toBeInTheDocument();
		expect(screen.getByText(/chocolate/)).toBeInTheDocument();
	});

	it("lista os itens encontrados com a contagem", () => {
		const items = [
			makeItem({ id: "1", name: "Arroz Branco" }),
			makeItem({ id: "2", name: "Arroz Integral" }),
		];

		render(
			<SearchResultsSection
				query="arroz"
				items={items}
				onStatusChange={vi.fn()}
				onEditItem={vi.fn()}
				onDeleteItem={vi.fn()}
			/>,
		);

		expect(screen.getByText("Arroz Branco")).toBeInTheDocument();
		expect(screen.getByText("Arroz Integral")).toBeInTheDocument();
		expect(screen.getByText("· 2")).toBeInTheDocument();
	});

	it("chama onEditItem ao clicar num item da lista", async () => {
		const user = userEvent.setup();
		const onEditItem = vi.fn();
		const items = [makeItem({ id: "1", name: "Arroz Branco" })];

		render(
			<SearchResultsSection
				query="arroz"
				items={items}
				onStatusChange={vi.fn()}
				onEditItem={onEditItem}
				onDeleteItem={vi.fn()}
			/>,
		);

		await user.click(screen.getByText("Arroz Branco"));

		expect(onEditItem).toHaveBeenCalledWith("1", undefined);
	});
});
