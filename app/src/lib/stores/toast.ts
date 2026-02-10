import { PersistedState } from 'runed';

export const toasts = new PersistedState<
	{ timestamp: Date; message: string; type: 'success' | 'error' | 'info' | 'warning' }[]
>('toasts', [], { storage: 'session' });

// function to add a toast message to the queue
export function toast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
	toasts.current.push({ timestamp: new Date(), message, type });
}
