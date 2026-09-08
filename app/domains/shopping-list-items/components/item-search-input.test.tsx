import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ItemSearchInput } from "./item-search-input";

describe("ItemSearchInput", () => {
	it("mostra o valor atual e chama onChange a cada tecla digitada", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ItemSearchInput value="" onChange={onChange} />);

		const input = screen.getByPlaceholderText("Buscar item por nome...");
		await user.type(input, "arr");

		expect(onChange).toHaveBeenCalledTimes(3);
		expect(onChange).toHaveBeenNthCalledWith(1, "a");
		expect(onChange).toHaveBeenNthCalledWith(2, "r");
		expect(onChange).toHaveBeenNthCalledWith(3, "r");
	});

	it("não mostra o botão de limpar quando o valor está vazio", () => {
		render(<ItemSearchInput value="" onChange={vi.fn()} />);

		expect(
			screen.queryByRole("button", { name: /limpar busca/i }),
		).not.toBeInTheDocument();
	});

	it("mostra o botão de limpar quando há valor, e chama onChange('') ao clicar", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ItemSearchInput value="arroz" onChange={onChange} />);

		const clearButton = screen.getByRole("button", { name: /limpar busca/i });
		await user.click(clearButton);

		expect(onChange).toHaveBeenCalledWith("");
	});
});
