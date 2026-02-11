import { execSync } from 'node:child_process';

export default function globalTeardown() {
	try {
		console.log('Cleaning up test services...');
		execSync('docker-compose -f ../docker-compose.test.yml down -v', { stdio: 'inherit' });
		console.log('Test services cleaned up successfully');
	} catch (error) {
		console.error('Error cleaning up test services:', error);
	}
}
