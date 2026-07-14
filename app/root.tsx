import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

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
		<html lang="pt-BR">
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
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
