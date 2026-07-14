// Exige exatamente 2 casas decimais — é isso que diferencia um preço de
// qualquer outro artefato numérico que o OCR possa ler (peso em gramas,
// código de barras truncado, número de corredor etc).
const PRICE_PATTERN = /\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2}|\d+\.\d{2}/g;
const PRICE_WITH_PREFIX_PATTERN = /R\$\s*(\d[\d.,]*\d)/i;

const MIN_PRICE = 0;
const MAX_PRICE = 10000;

function toNumber(match: string): number {
	if (match.includes(",") && match.includes(".")) {
		// "1.234,56" — ponto é separador de milhar, vírgula é decimal.
		return Number(match.replace(/\./g, "").replace(",", "."));
	}
	if (match.includes(",")) {
		// "12,99" — vírgula decimal (formato BR mais comum em etiquetas).
		return Number(match.replace(",", "."));
	}
	// "12.99" — já é um número JS válido.
	return Number(match);
}

function isPlausiblePrice(value: number): boolean {
	return Number.isFinite(value) && value > MIN_PRICE && value < MAX_PRICE;
}

// Só precisa ser "boa o suficiente pra pré-preencher" — o valor final ainda
// passa pela validação normal do `itemFormSchema` (Zod) no submit, então essa
// heurística é defesa em profundidade, não a única checagem.
export function extractPriceFromOcrText(rawText: string): number | null {
	// Mantém só dígitos e pontuação relevante (R$, vírgula, ponto, espaço) pra
	// não colar números que no texto original estavam separados por letras ou
	// quebras de linha.
	const cleaned = rawText.replace(/[^\dR$,.\s]/gi, " ");

	// Um número logo depois de "R$" é o sinal mais forte de que é o preço (e
	// não um fragmento de código de barras, peso em gramas etc).
	const withPrefix = cleaned.match(PRICE_WITH_PREFIX_PATTERN);
	if (withPrefix) {
		const value = toNumber(withPrefix[1]);
		if (isPlausiblePrice(value)) return value;
	}

	const candidates = (cleaned.match(PRICE_PATTERN) ?? [])
		.map(toNumber)
		.filter(isPlausiblePrice);

	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0];

	// Múltiplos números plausíveis e sem prefixo "R$": etiquetas raramente têm
	// outro número maior que o preço, e leituras truncadas do OCR tendem a
	// ficar menores que o valor real, não maiores.
	return Math.max(...candidates);
}
