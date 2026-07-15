import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import type { ReactNode } from "react";

import { ThemeProvider } from "~/providers/theme-provider";
import { Toaster } from "~/shared/components/ui/sonner";
import { TooltipProvider } from "~/shared/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<NuqsAdapter>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<TooltipProvider>
					{children}
					<Toaster position="top-center" closeButton richColors />
				</TooltipProvider>
			</ThemeProvider>
		</NuqsAdapter>
	);
}
