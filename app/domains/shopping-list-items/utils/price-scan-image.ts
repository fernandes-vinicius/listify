// Lado máximo (px) da imagem antes de enviar pro Gemini — fotos de celular
// costumam vir muito maiores que isso, o que só encarece/deixa mais lenta a
// requisição sem ganhar precisão numa etiqueta de preço pequena.
const MAX_DIMENSION = 1024;

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	const url = URL.createObjectURL(file);
	const img = new Image();
	img.src = url;
	try {
		await img.decode();
	} finally {
		URL.revokeObjectURL(url);
	}
	return img;
}

export interface EncodedImage {
	base64: string;
	mimeType: string;
}

// Redimensiona a imagem (mantendo cor — diferente do antigo pipeline de OCR,
// um modelo multimodal se beneficia do contexto colorido original) e
// devolve o base64 pronto pra mandar pra API de visão.
export function resizeImageToBase64(
	img: HTMLImageElement,
	maxDimension = MAX_DIMENSION,
): EncodedImage {
	const scale = Math.min(
		1,
		maxDimension / Math.max(img.naturalWidth, img.naturalHeight),
	);
	const width = Math.round(img.naturalWidth * scale);
	const height = Math.round(img.naturalHeight * scale);

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D context indisponível");

	ctx.drawImage(img, 0, 0, width, height);

	const mimeType = "image/jpeg";
	const dataUrl = canvas.toDataURL(mimeType, 0.85);
	const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);

	return { base64, mimeType };
}
