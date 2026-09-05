import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		clearMocks: true, // Can be removed in vitest v5
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
