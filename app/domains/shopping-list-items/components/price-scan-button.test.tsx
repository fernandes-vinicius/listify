import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PriceScanButton } from "./price-scan-button";

function getFileInput(container: HTMLElement): HTMLInputElement {
	const input = container.querySelector('input[type="file"]');
	if (!input) throw new Error("input de arquivo não encontrado");
	return input as HTMLInputElement;
}

describe("PriceScanButton — trava por código de 4 dígitos", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("bloqueado: clicar abre o modal de código e não abre a câmera", async () => {
		const user = userEvent.setup();
		const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");
		const { container } = render(<PriceScanButton onPriceDetected={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: /ler preço/i }));

		expect(await screen.findByText("Recurso restrito")).toBeInTheDocument();
		expect(clickSpy).not.toHaveBeenCalled();
		expect(getFileInput(container)).toBeInTheDocument();
	});

	it("código certo: destrava, fecha o modal, lembra no localStorage e abre a câmera", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ valid: true }), { status: 200 }),
				),
		);
		const clickSpy = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const user = userEvent.setup();
		render(<PriceScanButton onPriceDetected={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: /ler preço/i }));
		await screen.findByText("Recurso restrito");

		await user.type(screen.getByPlaceholderText("0000"), "2357");
		await user.click(screen.getByRole("button", { name: /confirmar/i }));

		await vi.waitFor(() => {
			expect(screen.queryByText("Recurso restrito")).not.toBeInTheDocument();
		});
		expect(window.localStorage.getItem("listify:price-scan-unlocked")).toBe(
			"true",
		);
		expect(clickSpy).toHaveBeenCalledTimes(1);
	});

	it("código errado: mostra erro, não destrava e mantém o modal aberto", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ valid: false }), { status: 200 }),
				),
		);
		const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");
		const user = userEvent.setup();
		render(<PriceScanButton onPriceDetected={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: /ler preço/i }));
		await screen.findByText("Recurso restrito");

		await user.type(screen.getByPlaceholderText("0000"), "0000");
		await user.click(screen.getByRole("button", { name: /confirmar/i }));

		expect(await screen.findByText("Código incorreto")).toBeInTheDocument();
		expect(screen.getByText("Recurso restrito")).toBeInTheDocument();
		expect(
			window.localStorage.getItem("listify:price-scan-unlocked"),
		).toBeNull();
		expect(clickSpy).not.toHaveBeenCalled();
	});

	it("já destravado (localStorage prévio): clicar abre a câmera direto, sem modal", async () => {
		window.localStorage.setItem("listify:price-scan-unlocked", "true");
		const clickSpy = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const user = userEvent.setup();
		render(<PriceScanButton onPriceDetected={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: /ler preço/i }));

		expect(screen.queryByText("Recurso restrito")).not.toBeInTheDocument();
		expect(clickSpy).toHaveBeenCalledTimes(1);
	});

	it("cancelar o modal fecha sem destravar", async () => {
		const user = userEvent.setup();
		render(<PriceScanButton onPriceDetected={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: /ler preço/i }));
		await screen.findByText("Recurso restrito");

		await user.click(screen.getByRole("button", { name: /cancelar/i }));

		await vi.waitFor(() => {
			expect(screen.queryByText("Recurso restrito")).not.toBeInTheDocument();
		});
		expect(
			window.localStorage.getItem("listify:price-scan-unlocked"),
		).toBeNull();
	});
});
