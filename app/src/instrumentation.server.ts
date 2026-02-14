// This file is executed before the rest of the SvelteKit server code when
// `kit.experimental.instrumentation.server` is enabled in svelte.config.js.
// It sets up OpenTelemetry auto-instrumentation and a Zipkin exporter when
// tracing is enabled via the ENABLE_TRACING env var.

const enabled = process.env.ENABLE_TRACING === '1' || process.env.ENABLE_TRACING === 'true';
import logger from '$lib/server/logger';

if (!enabled) {
	// Keep a tiny, non-throwing footprint when tracing is disabled
	// eslint-disable-next-line no-console
	logger.info('OpenTelemetry tracing is disabled (ENABLE_TRACING not set)');
} else {
	void (async () => {
		try {
			// Ensure auto-instrumentation hooks are registered prior to any imports
			const { createAddHookMessageChannel } = await import('import-in-the-middle');
			const { registerOptions } = createAddHookMessageChannel();
			// `register` comes from node:module and allows us to register the
			// import-in-the-middle hook so instrumentations patch modules when
			// they're imported.
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { register } = await import('node:module');
			register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions);

			const [sdkModule, autoInstrModule, zipkinModule, resourcesModule, semanticModule] =
				await Promise.all([
					import('@opentelemetry/sdk-node'),
					import('@opentelemetry/auto-instrumentations-node'),
					import('@opentelemetry/exporter-zipkin'),
					import('@opentelemetry/resources'),
					import('@opentelemetry/semantic-conventions')
				]);

			const NodeSDK =
				sdkModule.NodeSDK ?? sdkModule.default?.NodeSDK ?? sdkModule.default ?? sdkModule.NodeSDK;
			const getNodeAutoInstrumentations =
				autoInstrModule.getNodeAutoInstrumentations ?? autoInstrModule.default ?? autoInstrModule;
			const ZipkinExporter = zipkinModule.ZipkinExporter ?? zipkinModule.default ?? zipkinModule;
			const SemanticResourceAttributes =
				semanticModule.SemanticResourceAttributes ?? semanticModule;

			const zipkinUrl =
				process.env.ZIPKIN_URL ||
				process.env.OTEL_EXPORTER_ZIPKIN_ENDPOINT ||
				'http://localhost:9411/api/v2/spans';
			const serviceName = process.env.SERVICE_NAME || 'rocketbase-app';

			// Use resourceFromAttributes or defaultResource helpers exported by @opentelemetry/resources
			const resourcesAny: any = resourcesModule;
			// gather additional resource attributes: service.version (git commit) and deployment.environment
			let gitCommit = process.env.GIT_COMMIT;
			if (!gitCommit) {
				try {
					const cp = await import('node:child_process');
					gitCommit = String(cp.execSync('git rev-parse --short HEAD')).trim();
				} catch {
					// ignore if git not available
				}
			}

			const deploymentEnv =
				process.env.DEPLOYMENT_ENV ||
				process.env.NODE_ENV ||
				process.env.ENVIRONMENT ||
				'development';

			const attrs: Record<string, unknown> = {
				[SemanticResourceAttributes.SERVICE_NAME]: serviceName
			};
			if (gitCommit) {
				// semantic conventions may export SERVICE_VERSION; fall back to 'service.version'
				try {
					attrs[SemanticResourceAttributes.SERVICE_VERSION ?? 'service.version'] = gitCommit;
				} catch {
					attrs['service.version'] = gitCommit;
				}
			}
			attrs['deployment.environment'] = deploymentEnv;
			let resourceInstance = undefined;
			if (typeof resourcesAny.resourceFromAttributes === 'function') {
				resourceInstance = resourcesAny.resourceFromAttributes(attrs);
			} else if (typeof resourcesAny.defaultResource !== 'undefined') {
				// fall back to defaultResource if present (it already contains env-detected attributes)
				resourceInstance = resourcesAny.defaultResource;
			}

			// Pass serviceName to ZipkinExporter as some exporter/collector chains
			// expect an explicit service name in the payload; this ensures Zipkin
			// displays the correct service instead of 'unknown_service'.
			const sdk = new NodeSDK({
				...(resourceInstance ? { resource: resourceInstance } : {}),
				traceExporter: new ZipkinExporter({ url: zipkinUrl, serviceName }),
				instrumentations: [getNodeAutoInstrumentations()]
			});

			sdk.start();
			// eslint-disable-next-line no-console
			logger.info(`OpenTelemetry started; exporting to ${zipkinUrl} as ${serviceName}`);

			process.on('exit', () => {
				sdk.shutdown().catch(() => {});
			});
		} catch (err) {
			// eslint-disable-next-line no-console
			logger.withMetadata(err as Error).error('Failed to initialize OpenTelemetry tracing');
		}
	})();
}

export {};
