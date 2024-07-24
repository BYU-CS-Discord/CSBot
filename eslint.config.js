// @ts-check

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescript from 'typescript-eslint';
import deprecation from 'eslint-plugin-deprecation';
import fileProgress from 'eslint-plugin-file-progress';
import * as import_ from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
	{ ignores: ['dist', 'coverage', 'src/constants/version.ts'] },
	{ files: ['**/*.{m,c,}{js,ts}{x,}'] },

	// File progress
	{
		plugins: {
			'file-progress': fileProgress,
		},
		rules: {
			'file-progress/activate': 1,
		},
	},

	// Flat configs
	js.configs.recommended,
	...typescript.configs.strictTypeChecked,
	...typescript.configs.stylisticTypeChecked,
	stylistic.configs['disable-legacy'],
	stylistic.configs.customize({
		braceStyle: '1tbs',
		indent: 'tab',
		semi: true,
	}),
	prettierRecommended,
	unicorn.configs['flat/recommended'],

	// Main config
	{
		plugins: {
			import: import_,
			promise: promise,
			deprecation: deprecation,
		},
		languageOptions: {
			globals: globals.nodeBuiltin,
			parserOptions: {
				project: './tsconfig.eslint.json',
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
		rules: {
			// Recommended
			...import_.configs.recommended.rules,
			...import_.configs.typescript.rules,
			...promise.configs.recommended.rules,
			...deprecation.configs.recommended.rules,

			// Overrides
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
			'@typescript-eslint/no-confusing-void-expression': 0,
			'@typescript-eslint/no-inferrable-types': 0, // we like to be extra explicit with types sometimes
			'@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
			'@typescript-eslint/restrict-template-expressions': 0, // FIXME Lots of errors - fix later
			'import/no-unresolved': 0, // handled by TypeScript
			'no-redeclare': 0, // handled by TypeScript
			'no-shadow': 0, // handled by TypeScript
			'no-undef': 0, // handled by TypeScript
			'unicorn/filename-case': 0, // we use camelCase
			'unicorn/import-index': ['error', { ignoreImports: true }],
			'unicorn/no-array-callback-reference': 0,
			'unicorn/no-array-for-each': 0,
			'unicorn/no-null': 0, // we use null
			'unicorn/no-process-exit': 0, // we are a command-line app that might need to exit early
			'unicorn/no-useless-undefined': 0,
			'unicorn/prefer-module': 0, // we are not using ESM yet
			'unicorn/prefer-spread': 0,
			'unicorn/prefer-ternary': 0,
			'unicorn/prefer-top-level-await': 0, // we are not using ESM yet
			'unicorn/prevent-abbreviations': 0,
			'unicorn/switch-case-braces': 0,

			// Handled by Prettier
			'@stylistic/arrow-parens': 0,
			'@stylistic/comma-dangle': 0,
			'@stylistic/indent': 0,
			'@stylistic/indent-binary-ops': 0,
			'@stylistic/no-mixed-spaces-and-tabs': 0,
			'@stylistic/operator-linebreak': 0,
			'@stylistic/quotes': 0,
			'@stylistic/quote-props': 0,
			'unicorn/no-nested-ternary': 0,
			'unicorn/number-literal-case': 0,

			// Additions
			'@typescript-eslint/explicit-member-accessibility': 'error',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{ allowConciseArrowFunctionExpressionsStartingWithVoid: true },
			],
			'@typescript-eslint/no-shadow': ['error', { allow: ['err', 'resolve', 'reject', 'client'] }], // https://stackoverflow.com/a/63961972
			curly: ['error', 'multi-line', 'consistent'],
			'max-nested-callbacks': ['error', { max: 4 }],
			'no-console': 'warn',
			'no-empty-function': 'error',
			'no-lonely-if': 'error',
			yoda: 'error',
		},
	},

	// Scoped overrides
	{
		files: ['**/*.test.{m,c,}{js,ts}{x,}', '**/__mocks__/**'],
		rules: {
			'import/namespace': 0, // FIXME False positives in test files
		},
	},
];
