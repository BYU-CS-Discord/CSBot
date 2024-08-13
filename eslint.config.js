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

	// Legacy configs
	{
		plugins: { 'file-progress': fileProgress },
		rules: {
			'file-progress/activate': 1,
		},
	},
	{
		// FIXME eslint-plugin-import does not support flat config, so every time it throws a lint error, the error description
		// in the console will say "parserPath or languageOptions.parser is required! (undefined:undefined)".
		// Weird, but still useable.
		plugins: { import: import_ },
		rules: {
			...import_.configs.recommended.rules,
			...import_.configs.typescript.rules,
		},
	},
	{
		plugins: { promise },
		rules: promise.configs.recommended.rules,
	},
	{
		plugins: { deprecation },
		rules: deprecation.configs.recommended.rules,
	},

	// Scoped overrides
	{
		files: ['**/*.test.{m,c,}{js,ts}{x,}', '**/__mocks__/**'],
		rules: {
			'import/namespace': 0, // FIXME False positives in test files
		},
	},

	// Main config
	{
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
			// Handled by Prettier
			'@stylistic/arrow-parens': 0,
			'@stylistic/comma-dangle': 0,
			'@stylistic/indent': 0,
			'@stylistic/indent-binary-ops': 0,
			'@stylistic/no-mixed-spaces-and-tabs': 0,
			'@stylistic/quotes': 0,
			'@stylistic/operator-linebreak': 0,
			'@stylistic/quote-props': 0,
			'unicorn/no-nested-ternary': 0,
			'unicorn/number-literal-case': 0,

			// Overrides
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
			'@typescript-eslint/no-confusing-void-expression': 0,
			'@typescript-eslint/no-inferrable-types': 0, // We like to be extra explicit with types sometimes
			'@typescript-eslint/restrict-template-expressions': 0, // FIXME Lots of errors
			'import/no-unresolved': 0, // Handled by TypeScript
			'unicorn/filename-case': 0, // We use camelCase
			'unicorn/no-array-callback-reference': 0,
			'unicorn/no-array-for-each': 0,
			'unicorn/no-null': 0, // We use null
			'unicorn/prefer-spread': 0,
			'unicorn/prefer-ternary': 0,
			'unicorn/prevent-abbreviations': 0,
			'unicorn/switch-case-braces': 0,

			// Additions
			'@typescript-eslint/explicit-function-return-type': 'error',
			'@typescript-eslint/explicit-member-accessibility': 'error',
			'@typescript-eslint/no-shadow': 'error',
			curly: ['error', 'multi-line', 'consistent'],
			'max-nested-callbacks': ['error', { max: 4 }],
			'no-console': 'warn',
			'no-lonely-if': 'error',
			yoda: 'error',
		},
	},
];
