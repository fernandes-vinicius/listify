import { Analytics } from "@vercel/analytics/react";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import { ErrorPage } from "~/shared/components/error-page";
import { Search, TriangleAlert } from "~/shared/components/icons";
import { InstallPrompt } from "~/shared/components/pwa/install-prompt";
import { RegisterPWA } from "~/shared/components/pwa/register-pwa";

import type { Route } from "./+types/root";
import { AppProviders } from "./providers/app-providers";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "manifest", href: "/manifest.webmanifest" },
	{ rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#0d9488" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Listify" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<RegisterPWA />
				<InstallPrompt />
				<ScrollRestoration />
				<Scripts />
				<Analytics />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<AppProviders>
			<Outlet />
		</AppProviders>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error) && error.status === 404) {
		return (
			<ErrorPage
				icon={Search}
				title="Página não encontrada"
				description="Confira se o endereço foi digitado corretamente. Talvez a página tenha sido movida ou não exista mais."
			/>
		);
	}

	const description = isRouteErrorResponse(error)
		? error.statusText || "Ocorreu um erro inesperado."
		: "Ocorreu um erro inesperado. Tente novamente em instantes.";
	const stack =
		import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

	return (
		<>
			<ErrorPage
				icon={TriangleAlert}
				title="Algo deu errado"
				description={description}
			/>
			{stack && (
				<pre className="mx-auto w-full max-w-3xl overflow-x-auto p-4 text-xs">
					<code>{stack}</code>
				</pre>
			)}
		</>
	);
}
