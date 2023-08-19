import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		typecheck: {
			checker: 'tsc',
			tsconfig: './tsconfig.test.json',
		},
		mockReset: true,
		clearMocks: true,
		setupFiles: ['./vitestSetup.ts'],
		environment: 'node',
		coverage: {
			enabled: true,
			provider: 'istanbul',
			reportsDirectory: 'coverage',
		},
	},
});
