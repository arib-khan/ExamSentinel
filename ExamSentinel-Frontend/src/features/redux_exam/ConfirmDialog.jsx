import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, XCircle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = true,
  type = "info",
  remove
}) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="text-yellow-600 w-6 h-6" />;
      case "danger":
        return <XCircle className="text-red-600 w-6 h-6" />;
      default:
        return <Info className="text-blue-600 w-6 h-6" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center gap-3">
          {getIcon()}
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2 px-1 text-sm ">{message}</div>

        <DialogFooter className="flex gap-2 justify-end">
          {
            remove ? (null) :
              (
                <>
                  {showCancel && (
                    <Button variant="outline" onClick={onCancel}>
                      {cancelText}
                    </Button>
                  )}
                </>
              )
          }
          <Button
            variant={type === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
