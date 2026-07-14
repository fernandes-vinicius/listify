import type { ReactNode } from "react";

import { Toaster } from "~/shared/components/ui/sonner";
import { TooltipProvider } from "~/shared/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<TooltipProvider>
			{children}
			<Toaster />
		</TooltipProvider>
	);
}
