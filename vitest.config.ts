import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Config separada do vite.config.ts principal: o plugin `reactRouter()` (que
// gera as rotas/tipos da SPA) não serve pra rodar arquivos de teste soltos
// fora do fluxo de rotas — aqui basta o `@vitejs/plugin-react` puro pra JSX +
// fast refresh, com o mesmo alias `~/*` via `tsconfigPaths`.
export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		// `globals: true` é o que permite o auto-cleanup do
		// @testing-library/react (ele detecta o `afterEach` global do runner
		// pra desmontar entre testes) — sem isso o DOM de um teste vaza pro
		// próximo no mesmo arquivo.
		globals: true,
	},
});
