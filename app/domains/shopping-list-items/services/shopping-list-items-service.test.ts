import { describe, expect, it } from "vitest";
import { addItem } from "./shopping-list-items-service";

function makeStorage(listId: string) {
	return { lists: [{ id: listId, items: [] }] };
}

const baseInput = {
	name: "Arroz",
	quantity: 1,
	unit: "kg",
	price: 10,
};

describe("addItem", () => {
	it("cria o item sem grupo quando groupId não é informado", () => {
		const storage = makeStorage("list-1");

		const { item } = addItem(storage, "list-1", baseInput);

		expect(item?.groupId).toBeNull();
	});

	it("cria o item já dentro do grupo informado", () => {
		const storage = makeStorage("list-1");

		const { item } = addItem(storage, "list-1", {
			...baseInput,
			groupId: "group-1",
		});

		expect(item?.groupId).toBe("group-1");
	});

	it("persiste o groupId no storage retornado", () => {
		const storage = makeStorage("list-1");

		const { storage: next } = addItem(storage, "list-1", {
			...baseInput,
			groupId: "group-1",
		});

		expect(next.lists[0].items[0].groupId).toBe("group-1");
	});

	it("trata groupId explicitamente null como sem grupo", () => {
		const storage = makeStorage("list-1");

		const { item } = addItem(storage, "list-1", {
			...baseInput,
			groupId: null,
		});

		expect(item?.groupId).toBeNull();
	});
});
