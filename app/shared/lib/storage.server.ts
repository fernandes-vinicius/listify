import { createCookie } from "react-router";

// Todos os dados do app (listas + itens) vivem num único cookie, lido e
// gravado inteiramente no servidor (loader/action) — o client nunca acessa
// esse cookie diretamente. `httpOnly` garante isso mesmo contra XSS.
//
// Atenção: cookies têm um limite prático de ~4KB por cookie no navegador.
// Esse único cookie guarda TODAS as listas e itens do usuário — com uso
// intenso (várias listas, muitos itens) esse limite pode ser atingido, e
// nesse caso o navegador simplesmente recusa gravar o cookie (dado mais
// recente é perdido silenciosamente). Se isso virar um problema real, a
// solução é dividir por lista (um cookie por lista) ou migrar pra um storage
// server-side de verdade (arquivo/banco).
const dataCookie = createCookie("listify_data", {
	maxAge: 60 * 60 * 24 * 400, // ~400 dias — o máximo que a maioria dos navegadores aceita
	path: "/",
	sameSite: "lax",
	httpOnly: true,
	secure: import.meta.env.PROD,
});

export async function readStorage<T>(
	request: Request,
	fallback: T,
): Promise<T> {
	try {
		const value = await dataCookie.parse(request.headers.get("Cookie"));
		return (value as T) ?? fallback;
	} catch {
		return fallback;
	}
}

export async function serializeStorage<T>(data: T): Promise<string> {
	return dataCookie.serialize(data);
}
