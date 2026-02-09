import { toast } from 'svelte-sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

function createToastStore() {
  return {
    /**
     * Add a toast message
     */
    add: (message: string, type: ToastType = 'info') => {
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        case 'info':
        default:
          toast.info(message);
          break;
      }
    },
    /**
     * Add a success toast
     */
    success: (message: string) => {
      toast.success(message);
    },
    /**
     * Add an error toast
     */
    error: (message: string) => {
      toast.error(message);
    },
    /**
     * Add a warning toast
     */
    warning: (message: string) => {
      toast.warning(message);
    },
    /**
     * Add an info toast
     */
    info: (message: string) => {
      toast.info(message);
    },
  };
}

export const toastQueue = createToastStore();
