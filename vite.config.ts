import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		tailwindcss(),
		reactRouter(),
		VitePWA({
			registerType: "autoUpdate",
			outDir: "build/client",
			// SPA mode (`ssr: false` em react-router.config.ts) não tem index.html
			// próprio pro plugin injetar — o service worker é registrado
			// manualmente a partir de um componente client (ver register-pwa.tsx).
			injectRegister: null,
			manifest: {
				name: "Listify",
				short_name: "Listify",
				description: "Listify — suas listas de compras, offline-first.",
				lang: "pt-BR",
				start_url: "/",
				scope: "/",
				display: "standalone",
				theme_color: "#0d9488",
				background_color: "#ffffff",
				icons: [
					{ src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
					{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
					{
						src: "maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
				// Os .js do Tesseract (worker.min.js, tesseract-core-lstm.wasm.js)
				// bateriam no globPattern acima e entrariam no precache inicial da
				// instalação do PWA — excluídos aqui porque só quem usa o scanner de
				// preço deve baixar esses ~4MB, via o runtimeCaching abaixo.
				globIgnores: ["tesseract/**/*"],
				// App 100% client-side (dados em localStorage) — cachear o shell da
				// SPA permite navegação completa offline, diferente de uma app SSR
				// onde o HTML precisa vir do servidor a cada navegação.
				navigateFallback: "/index.html",
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				// Assets do Tesseract.js (worker + core WASM + dados de idioma) não
				// entram no precache — só quem usa o scanner de preço baixa esses
				// ~9-10MB, e a partir daí ficam disponíveis offline via cache-first.
				runtimeCaching: [
					{
						urlPattern: /\/tesseract\//,
						handler: "CacheFirst",
						options: {
							cacheName: "tesseract-assets",
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
				],
			},
			devOptions: {
				enabled: true,
				// SW é generateSW (padrão) — serve como classic worker em dev.
				type: "classic",
			},
		}),
	],
});
