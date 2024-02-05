import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
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
