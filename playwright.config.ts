import path from 'path';
import { defineConfig } from '@playwright/test';

process.env.WP_ARTIFACTS_PATH ??= path.join( process.cwd(), 'artifacts' );
process.env.STORAGE_STATE_PATH ??= path.join(
	process.env.WP_ARTIFACTS_PATH,
	'storage-states/admin.json'
);

export default defineConfig( {
	testDir: './tests/e2e',
	timeout: 60_000,
	globalSetup: require.resolve(
		'@wordpress/scripts/config/playwright/global-setup.js'
	),
	use: {
		baseURL: process.env.WP_BASE_URL || 'http://localhost:8889',
		storageState: process.env.STORAGE_STATE_PATH,
		trace: 'retain-on-failure',
	},
} );
