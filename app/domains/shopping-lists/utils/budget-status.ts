export type BudgetStatus = "ok" | "close" | "over";

// A partir de 90% do orçamento já é considerado "perto do limite", mesmo sem
// ter ultrapassado ainda. Usado tanto no alerta da página da lista quanto no
// card da lista na home, pra manter os dois lugares consistentes.
const CLOSE_TO_BUDGET_RATIO = 0.9;

export function getBudgetStatus(
	estimatedTotal: number,
	budget: number,
): BudgetStatus {
	if (estimatedTotal > budget) return "over";
	if (estimatedTotal / budget >= CLOSE_TO_BUDGET_RATIO) return "close";
	return "ok";
}
