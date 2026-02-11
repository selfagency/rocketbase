declare module '$lib/paraglide/messages.js' {
	// Provide a fallback index signature so consumers can index the module
	// namespace with arbitrary keys (e.g. `m['home.title']()`). The actual
	// runtime module is generated and will export many named functions; this
	// declaration only exists to make TypeScript happy and will not affect
	// runtime behavior.
	const messages: Record<string, (...args: any[]) => any>;
	export = messages;
}
