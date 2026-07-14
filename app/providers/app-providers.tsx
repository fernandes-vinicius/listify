import type { ReactNode } from "react";

import { ThemeProvider } from "~/providers/theme-provider";
import { Toaster } from "~/shared/components/ui/sonner";
import { TooltipProvider } from "~/shared/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<TooltipProvider>
				{children}
				<Toaster />
			</TooltipProvider>
		</ThemeProvider>
	);
}
