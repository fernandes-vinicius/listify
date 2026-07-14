import type { Config } from "@react-router/dev/config";

export default {
	// Dados vivem em localStorage (browser-only), então rodamos em modo SPA:
	// clientLoader/clientAction no lugar de loader/action server-side.
	ssr: false,
} satisfies Config;
