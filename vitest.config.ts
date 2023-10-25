import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import/no-default-export
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
