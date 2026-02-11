import { execSync } from 'node:child_process';

export default function globalTeardown() {
	// Skip cleanup in CI - GitHub Actions handles container cleanup automatically
	if (process.env.CI) {
		console.log('Skipping test service cleanup in CI environment');
		return;
	}

	try {
		console.log('Cleaning up test services...');
		execSync('docker-compose -f ../docker-compose.test.yml down -v', { stdio: 'inherit' });
		console.log('Test services cleaned up successfully');
	} catch (error) {
		console.error('Error cleaning up test services:', error);
	}
}
