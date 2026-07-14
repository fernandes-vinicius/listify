// Lado máximo (px) da imagem antes do OCR — fotos de celular costumam vir
// muito maiores que isso, o que só deixa o Tesseract mais lento sem ganhar
// precisão numa etiqueta de preço pequena.
const MAX_DIMENSION = 1200;

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

// Reduz o tamanho e aplica escala de cinza + mais contraste — ajuda o OCR a
// distinguir dígitos de ruído/sombra em fotos tiradas rapidamente no mercado.
// Cropping manual, binarização adaptativa e correção de inclinação ficam como
// melhoria futura; não são necessários pra etiquetas impressas comuns.
export function preprocessForOcr(img: HTMLImageElement): HTMLCanvasElement {
	const scale = Math.min(
		1,
		MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight),
	);
	const width = Math.round(img.naturalWidth * scale);
	const height = Math.round(img.naturalHeight * scale);

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D context indisponível");

	ctx.filter = "grayscale(1) contrast(1.2)";
	ctx.drawImage(img, 0, 0, width, height);

	return canvas;
}
