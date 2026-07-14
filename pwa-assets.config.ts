import {
	defineConfig,
	minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
	preset: minimal2023Preset,
	// Assets são gerados no mesmo diretório da imagem de origem, então fica na
	// raiz de public/ (não em public/images/) pra cair onde o manifest e o
	// root.tsx esperam (caminhos relativos à raiz do site).
	images: ["public/logo-listify-icon.svg"],
});
