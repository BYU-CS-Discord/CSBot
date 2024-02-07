import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
// eslint-disable-next-line import/no-unresolved
import tsParser from '@typescript-eslint/parser';
// eslint-disable-next-line import/no-unresolved
import typescript from '@typescript-eslint/eslint-plugin';
import deprecation from 'eslint-plugin-deprecation';
import fileProgress from 'eslint-plugin-file-progress';
import import_ from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';
import vitest from 'eslint-plugin-vitest';

import globals from 'globals';

export default [
	{
		ignores: ['dist', 'coverage', 'src/constants/version.ts'],
	},

	// File progress
	{
		plugins: {
			'file-progress': fileProgress,
		},
		rules: {
			'file-progress/activate': 1,
		},
	},

	// Pre-built configs
	prettierRecommended,
	unicorn.configs['flat/recommended'],

	// Main config
	{
		files: ['**/*.{m,c,}{js,ts}{x,}'],
		plugins: {
			'@stylistic': stylistic,
			import: import_,
			promise: promise,
		},
		languageOptions: {
			globals: globals.nodeBuiltin,
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
		rules: {
			// Recommended
			...js.configs.recommended.rules,
			...stylistic.configs['recommended-flat'].rules,
			...import_.configs.recommended.rules,
			...import_.configs.typescript.rules,
			...promise.configs.recommended.rules,

			// Handled by Prettier
			'@stylistic/arrow-parens': 0,
			'@stylistic/comma-dangle': 0,
			'@stylistic/indent': 0,
			'@stylistic/indent-binary-ops': 0,
			'@stylistic/no-mixed-spaces-and-tabs': 0,
			'@stylistic/quotes': 0,
			'no-mixed-spaces-and-tabs': 0,

			// Overrides
			'@stylistic/brace-style': 'error',
			'@stylistic/jsx-indent': ['error', 'tab'],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
			'@stylistic/no-tabs': 0,
			'@stylistic/operator-linebreak': 0, // clashes with prettier
			'@stylistic/quote-props': 0, // clashes with prettier
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/member-delimiter-style': 'error',
			'unicorn/filename-case': 0, // we use camelCase
			'unicorn/import-index': ['error', { ignoreImports: true }],
			'unicorn/no-array-callback-reference': 0,
			'unicorn/no-array-for-each': 0,
			'unicorn/no-nested-ternary': 0, // clashes with prettier
			'unicorn/no-null': 0, // we use null
			'unicorn/no-process-exit': 0, // we are a command-line app that might need to exit early
			'unicorn/no-useless-undefined': 0,
			'unicorn/number-literal-case': 0, // clashes with prettier
			'unicorn/prefer-module': 0, // we are not using ESM yet
			'unicorn/prefer-spread': 0,
			'unicorn/prefer-ternary': 0,
			'unicorn/prefer-top-level-await': 0, // we are not using ESM yet
			'unicorn/prevent-abbreviations': 0,
			'unicorn/switch-case-braces': 0,

			// Additions
			curly: ['error', 'multi-line', 'consistent'],
			'max-nested-callbacks': ['error', { max: 4 }],
			'no-console': 'warn',
			'no-empty-function': 'error',
			'no-lonely-if': 'error',
			'no-shadow': 'error',
			yoda: 'error',
		},
	},

	// TypeScript
	{
		files: ['**/*.{m,c,}ts{x,}'],
		plugins: {
			'@typescript-eslint': typescript,
			deprecation: deprecation,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.eslint.json',
			},
		},
		rules: {
			// Recommended
			...typescript.configs['strict-type-checked'].rules,
			...typescript.configs['stylistic-type-checked'].rules,
			...deprecation.configs.recommended.rules,

			// Overrides
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'separate-type-imports',
					disallowTypeAnnotations: false,
				},
			], // Replaces `importsNotUsedAsValues` tsconfig flag
			'@typescript-eslint/no-confusing-void-expression': 0,
			'@typescript-eslint/no-inferrable-types': 0, // we like to be extra explicit with types sometimes
			'@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
			'import/namespace': 0, // FIXME false positives in test files
			'import/no-unresolved': 0, // handled by TypeScript
			'no-redeclare': 0, // handled by TypeScript
			'no-shadow': 0, // handled by TypeScript
			'no-undef': 0, // handled by TypeScript

			// Additions
			'@typescript-eslint/explicit-member-accessibility': [
				'error',
				{ accessibility: 'no-public', overrides: { properties: 'off' } },
			],
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{ allowConciseArrowFunctionExpressionsStartingWithVoid: true },
			],
			'@typescript-eslint/no-shadow': ['error', { allow: ['err', 'resolve', 'reject', 'client'] }], // https://stackoverflow.com/a/63961972
		},
	},

	// Vitest
	{
		files: ['**/*.test.{m,c,}{js,ts}{x,}'],
		plugins: {
			vitest: vitest,
		},
		rules: {
			...vitest.configs.recommended.rules,
		},
	},
];
