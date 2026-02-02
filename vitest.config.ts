import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		mockReset: true,
		typecheck: {
			checker: 'tsc',
			tsconfig: './tsconfig.json',
		},
		coverage: {
			enabled: true,
			provider: 'istanbul',
			reportsDirectory: 'coverage',
		},
	},
});
