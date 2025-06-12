// @ts-check

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { configs as typescriptConfigs } from 'typescript-eslint';
import fileProgress from 'eslint-plugin-file-progress';
import * as importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
	{ ignores: ['dist', 'coverage', 'src/constants/version.ts'] },
	{ files: ['**/*.{m,c,}{js,ts}{x,}'] },

	// Flat configs
	js.configs.recommended,
	...typescriptConfigs.strictTypeChecked,
	...typescriptConfigs.stylisticTypeChecked,
	stylistic.configs['disable-legacy'],
	stylistic.configs.customize({
		braceStyle: '1tbs',
		indent: 'tab',
		semi: true,
	}),
	prettierRecommended,
	unicorn.configs.recommended,
	importPlugin.flatConfigs?.recommended,
	importPlugin.flatConfigs?.typescript,
	{
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: ['./tsconfig.eslint.json'],
				},
			},
		},
	},

	// Legacy configs
	{
		plugins: { 'file-progress': fileProgress },
		rules: {
			'file-progress/activate': 1,
		},
	},
	{
		plugins: { promise },
		rules: promise.configs.recommended.rules,
	},

	// Scoped overrides
	{
		files: ['**/*.test.{m,c,}{js,ts}{x,}', '**/__mocks__/**'],
		rules: {
			'import/namespace': 'off', // FIXME False positives in test files
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
			'@stylistic/arrow-parens': 'off',
			'@stylistic/comma-dangle': 'off',
			'@stylistic/indent': 'off',
			'@stylistic/indent-binary-ops': 'off',
			'@stylistic/no-mixed-spaces-and-tabs': 'off',
			'@stylistic/quotes': 'off',
			'@stylistic/operator-linebreak': 'off',
			'@stylistic/quote-props': 'off',
			'unicorn/no-nested-ternary': 'off',
			'unicorn/number-literal-case': 'off',

			// Overrides
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
			'@typescript-eslint/no-inferrable-types': 'off', // We like to be extra explicit with types sometimes
			'@typescript-eslint/restrict-template-expressions': 'off', // FIXME Lots of errors
			'@typescript-eslint/no-deprecated': 'warn', // Formerly handled by eslint-plugin-deprecation
			'@typescript-eslint/no-misused-spread': 'off', // Lots of things are spreadable in discord.js that eslint can't see well
			'import/no-unresolved': 'off', // Handled by TypeScript
			'unicorn/filename-case': 'off', // We use camelCase
			'unicorn/no-array-callback-reference': 'off',
			'unicorn/no-array-for-each': 'off',
			'unicorn/no-null': 'off', // We use null
			'unicorn/prefer-spread': 'off',
			'unicorn/prefer-ternary': 'off',
			'unicorn/prevent-abbreviations': 'off',

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
