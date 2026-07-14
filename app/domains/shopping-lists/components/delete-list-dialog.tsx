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

interface DeleteListDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listName: string;
	onConfirm: () => void;
}

export function DeleteListDialog({
	open,
	onOpenChange,
	listName,
	onConfirm,
}: DeleteListDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir "{listName}"?</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação remove a lista e todos os seus itens permanentemente. Não
						é possível desfazer.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={onConfirm}>
						Excluir
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
