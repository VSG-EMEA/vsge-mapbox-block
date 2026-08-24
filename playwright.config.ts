import { defineConfig } from '@playwright/test';

export default defineConfig( {
	testDir: './tests/e2e',
	timeout: 60_000,
	use: {
		baseURL: process.env.WP_BASE_URL || 'http://localhost:8889',
		trace: 'retain-on-failure',
	},
} );
