import type { ReactNode } from "react";
import { TooltipProvider } from "~/shared/components/ui/tooltip";
import { Toaster } from "~/shared/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<TooltipProvider>
			{children}
			<Toaster />
		</TooltipProvider>
	);
}
