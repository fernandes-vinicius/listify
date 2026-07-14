// Único arquivo que importa `tesseract.js` — fronteira exclusiva do `import()`
// dinâmico, pra manter a lib (pesada, ~2-3MB com WASM) fora do bundle
// principal e só baixada quando o botão de câmera é realmente usado.
//
// Assets self-hosted em public/tesseract/ (worker.min.js, o core WASM
// LSTM-only sem SIMD, e o traineddata de inglês) em vez de depender da CDN
// jsDelivr padrão do tesseract.js, pra funcionar offline via PWA. Gerados a
// partir de tesseract.js@7.0.0 / tesseract.js-core@7.0.0:
//   cp node_modules/tesseract.js/dist/worker.min.js public/tesseract/
//   cp node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js public/tesseract/
//   cp node_modules/tesseract.js-core/tesseract-core-lstm.wasm public/tesseract/
//   curl -o public/tesseract/eng.traineddata.gz \
//     https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz
// Re-gerar esses arquivos ao atualizar a versão do tesseract.js.
export async function recognizePriceFromImage(
	image: HTMLCanvasElement,
): Promise<string> {
	const { createWorker, PSM } = await import("tesseract.js");

	// "eng" (não "por") porque só precisamos ler dígitos/R$/vírgula/ponto, não
	// português de verdade — dígitos não são específicos de idioma, e o
	// traineddata de inglês é menor. OEM 1 = LSTM_ONLY, casa com o core
	// hospedado (tesseract-core-lstm.wasm.js).
	const worker = await createWorker("eng", 1, {
		workerPath: "/tesseract/worker.min.js",
		corePath: "/tesseract/tesseract-core-lstm.wasm.js",
		langPath: "/tesseract",
		gzip: true,
		// Por padrão o tesseract.js spawna o worker a partir de uma blob: URL
		// que só faz `importScripts(workerPath)` — isso dá ao worker uma origem
		// opaca que o Service Worker do PWA não consegue interceptar, então os
		// assets nunca eram cacheados via o runtimeCaching configurado no
		// vite.config.ts (confirmado inspecionando os requests: aconteciam e
		// tinham sucesso, mas nunca apareciam em nenhum Cache Storage). Com
		// `false`, o worker é criado direto de `workerPath` (uma URL real sob o
		// escopo do SW), permitindo a interceptação/cache funcionar.
		workerBlobURL: false,
	});

	try {
		await worker.setParameters({
			tessedit_char_whitelist: "0123456789R$,.",
			// Etiqueta de preço é texto curto e espalhado, não um parágrafo.
			tessedit_pageseg_mode: PSM.SPARSE_TEXT,
		});
		const { data } = await worker.recognize(image);
		return data.text;
	} finally {
		// Worker é criado e terminado a cada scan — ação pontual, não uma
		// feature persistente, então não vale a pena gerenciar ciclo de vida
		// entre usos pra economizar ~1-2s de re-init.
		await worker.terminate();
	}
}
