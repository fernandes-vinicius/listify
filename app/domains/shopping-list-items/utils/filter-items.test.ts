import { describe, expect, it } from "vitest";
import type { ShoppingItem } from "~/domains/shopping-list-items/types/item-types";
import { filterItemsByName } from "./filter-items";

function makeItem(overrides: Partial<ShoppingItem>): ShoppingItem {
	return {
		id: "item-1",
		name: "Arroz",
		quantity: 1,
		unit: "kg",
		price: 0,
		status: "unchecked",
		order: 0,
		createdAt: new Date().toISOString(),
		groupId: null,
		...overrides,
	};
}

describe("filterItemsByName", () => {
	it("retorna todos os itens quando a busca está vazia", () => {
		const items = [makeItem({ id: "1", name: "Arroz" })];

		expect(filterItemsByName(items, "")).toEqual(items);
	});

	it("retorna todos os itens quando a busca é só espaços", () => {
		const items = [makeItem({ id: "1", name: "Arroz" })];

		expect(filterItemsByName(items, "   ")).toEqual(items);
	});

	it("filtra por substring, ignorando maiúsculas/minúsculas", () => {
		const items = [
			makeItem({ id: "1", name: "Arroz Branco" }),
			makeItem({ id: "2", name: "Feijão Preto" }),
		];

		expect(filterItemsByName(items, "arroz")).toEqual([items[0]]);
		expect(filterItemsByName(items, "ARROZ")).toEqual([items[0]]);
	});

	it("bate no meio do nome, não só no começo", () => {
		const items = [makeItem({ id: "1", name: "Leite Integral" })];

		expect(filterItemsByName(items, "integral")).toEqual(items);
	});

	it("ignora espaços nas pontas da busca", () => {
		const items = [makeItem({ id: "1", name: "Arroz" })];

		expect(filterItemsByName(items, "  arroz  ")).toEqual(items);
	});

	it("retorna lista vazia quando nada bate", () => {
		const items = [makeItem({ id: "1", name: "Arroz" })];

		expect(filterItemsByName(items, "chocolate")).toEqual([]);
	});

	it("ignora acentos: buscar sem acento bate em nome acentuado", () => {
		const items = [makeItem({ id: "1", name: "Limão" })];

		expect(filterItemsByName(items, "limao")).toEqual(items);
	});

	it("ignora acentos: buscar acentuado bate em nome sem acento", () => {
		const items = [makeItem({ id: "1", name: "Limao" })];

		expect(filterItemsByName(items, "limão")).toEqual(items);
	});

	it("ignora acentos em outros diacríticos comuns (cedilha, circunflexo)", () => {
		const items = [
			makeItem({ id: "1", name: "Açúcar" }),
			makeItem({ id: "2", name: "Pêra" }),
		];

		expect(filterItemsByName(items, "acucar")).toEqual([items[0]]);
		expect(filterItemsByName(items, "pera")).toEqual([items[1]]);
	});
});
