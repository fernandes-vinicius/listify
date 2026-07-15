import { Link } from "react-router";

import type { LucideIcon } from "~/shared/components/icons";
import { ArrowLeft, ShoppingBasket } from "~/shared/components/icons";
import { Logo } from "~/shared/components/logo";
import { Button } from "~/shared/components/ui/button";

interface ErrorPageProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function ErrorPage({ icon: Icon, title, description }: ErrorPageProps) {
	return (
		<div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20 lg:px-12">
			<title>{`${title} — Listify`}</title>

			<div className="z-20 flex flex-col items-start gap-6 lg:max-w-md">
				<Logo />

				<div className="flex flex-col gap-3">
					<h1 className="font-heading font-medium text-4xl text-foreground leading-tight sm:text-5xl">
						{title}
					</h1>
					<p className="max-w-xs text-balance font-normal text-muted-foreground text-sm">
						{description}
					</p>
				</div>

				<Button
					size="lg"
					render={
						<Link to="/">
							<ArrowLeft />
							Voltar para suas listas
						</Link>
					}
				/>
			</div>

			{/* Illustration */}
			<div className="fixed top-2 right-2 z-10 flex flex-1 items-center justify-center sm:relative">
				<div className="relative flex size-64 items-center justify-center sm:size-80">
					<div className="absolute size-56 rounded-full bg-primary/8 sm:size-72" />
					<div className="-translate-x-6 -translate-y-8 absolute size-24 rounded-full bg-primary/15 sm:size-28" />
					<div className="absolute size-4 translate-x-24 translate-y-20 rounded-full bg-primary/25 sm:translate-x-28 sm:translate-y-24" />
					<div className="-translate-y-24 absolute size-3 translate-x-16 rounded-full bg-primary/30 sm:translate-x-20" />

					<ShoppingBasket
						className="-rotate-12 relative size-32 text-primary sm:size-40"
						strokeWidth={1.25}
					/>
					<div className="-right-1 -bottom-1 absolute flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground sm:size-16">
						<Icon className="size-6 sm:size-7" />
					</div>
				</div>
			</div>
		</div>
	);
}
