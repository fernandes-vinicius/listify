export function meta() {
	return [{ title: "Página não encontrada — Listify" }];
}

export async function clientLoader() {
	throw new Response("Not Found", { status: 404 });
}

export default function CatchAll() {
	return null;
}
