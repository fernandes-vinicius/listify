import { useEffect, useState } from "react";

import { Download, Plus, Share, X } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "listify:pwa-install-dismissed";

function isIos() {
	if (typeof navigator === "undefined") return false;
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
	if (typeof window === "undefined") return false;
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		// iOS Safari
		(window.navigator as unknown as { standalone?: boolean }).standalone ===
			true
	);
}

// Callout de instalação customizado. No Android/Chrome captura o evento
// nativo `beforeinstallprompt` e mostra um banner "Instalar". No iOS Safari
// (que nunca dispara esse evento) mostra instruções manuais de "Adicionar à
// Tela de Início". Dispensas ficam salvas em localStorage.
//
// Nota: só aparece em contexto seguro (HTTPS ou localhost) com o service
// worker ativo — não aparece sobre um endereço LAN em HTTP puro.
export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showIosHint, setShowIosHint] = useState(false);

	useEffect(() => {
		if (isInStandaloneMode()) return;
		if (localStorage.getItem(DISMISS_KEY)) return;

		if (isIos()) {
			setShowIosHint(true);
			return;
		}

		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};
		window.addEventListener("beforeinstallprompt", handler);

		const installed = () => {
			setDeferredPrompt(null);
			localStorage.setItem(DISMISS_KEY, "1");
		};
		window.addEventListener("appinstalled", installed);

		return () => {
			window.removeEventListener("beforeinstallprompt", handler);
			window.removeEventListener("appinstalled", installed);
		};
	}, []);

	const dismiss = () => {
		localStorage.setItem(DISMISS_KEY, "1");
		setDeferredPrompt(null);
		setShowIosHint(false);
	};

	const install = async () => {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") localStorage.setItem(DISMISS_KEY, "1");
		setDeferredPrompt(null);
	};

	const visible = deferredPrompt || showIosHint;
	if (!visible) return null;

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 select-none px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
			<div className="pointer-events-auto mx-auto flex max-w-md select-auto items-center gap-3 rounded border border-border bg-popover p-3 text-popover-foreground shadow-lg">
				<img
					src="/pwa-192x192.png"
					alt="Listify"
					className="size-11 shrink-0 rounded"
				/>

				<div className="min-w-0 flex-1">
					<p className="font-semibold text-xs leading-tight">
						Instale o app Listify
					</p>

					{showIosHint ? (
						<p className="mt-0.5 text-muted-foreground text-xs leading-snug">
							Toque em{" "}
							<Share className="-translate-y-px inline-block size-3.5" /> e em{" "}
							<span className="whitespace-nowrap">
								"Adicionar à Tela de Início"
							</span>{" "}
							<Plus className="-translate-y-px inline-block size-3.5" />
						</p>
					) : (
						<p className="mt-0.5 text-muted-foreground text-xs">
							Acesso rápido, direto da sua tela inicial.
						</p>
					)}
				</div>

				{!showIosHint && (
					<Button size="sm" onClick={install} className="shrink-0">
						<Download />
						Instalar
					</Button>
				)}

				<button
					type="button"
					onClick={dismiss}
					aria-label="Fechar"
					className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
				>
					<X />
				</button>
			</div>
		</div>
	);
}
