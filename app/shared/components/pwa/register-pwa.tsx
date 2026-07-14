import { useRegisterSW } from "virtual:pwa-register/react";

// Registra o service worker no client. Com `registerType: "autoUpdate"`
// configurado no vite.config.ts, novas versões são aplicadas silenciosamente
// em segundo plano — sem UI necessária. Não renderiza nada e é um no-op
// durante SSR (useRegisterSW só roda no browser).
export function RegisterPWA() {
	useRegisterSW({
		immediate: true,
		onRegisteredSW(swUrl, registration) {
			console.info("[PWA] SW registrado:", swUrl, registration);
		},
		onRegisterError(error) {
			console.error("[PWA] Falha ao registrar o SW:", error);
		},
	});
	return null;
}
