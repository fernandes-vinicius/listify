import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/shared/components/ui/alert-dialog";

interface DeleteGroupDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	groupName: string;
	onConfirm: () => void;
}

export function DeleteGroupDialog({
	open,
	onOpenChange,
	groupName,
	onConfirm,
}: DeleteGroupDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remover grupo "{groupName}"?</AlertDialogTitle>
					<AlertDialogDescription>
						Os itens desse grupo voltam para a lista solta, sem agrupamento.
						Nenhum item é excluído.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={onConfirm}>
						Remover
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
