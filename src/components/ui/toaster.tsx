import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider data-oid="1-_z-j8">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} data-oid="tn8-zdx">
            <div className="grid gap-1" data-oid="cof0ec9">
              {title && <ToastTitle data-oid="6s0.om9">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-oid="-:cl0ca">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-oid="vclfs4l" />
          </Toast>
        );
      })}
      <ToastViewport data-oid="zuya5xd" />
    </ToastProvider>
  );
}
