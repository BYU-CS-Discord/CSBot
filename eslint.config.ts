import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { configs as typescriptConfigs } from 'typescript-eslint';
import progress from 'eslint-plugin-file-progress';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig(
	{ files: ['**/*.{m,c,}{js,ts}{x,}'] },
	globalIgnores(['dist', 'coverage', 'src/constants/version.ts']),
	{
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
	},

	js.configs.recommended,
	{
		rules: {
			// Additions
			curly: ['error', 'multi-line', 'consistent'],
			'max-nested-callbacks': ['error', { max: 4 }],
			'no-console': 'warn',
			'no-lonely-if': 'error',
			yoda: 'error',
		},
	},

	typescriptConfigs.strictTypeChecked,
	typescriptConfigs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			// Overrides
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
			'@typescript-eslint/restrict-template-expressions': 'off', // FIXME Lots of errors
			'@typescript-eslint/no-misused-spread': 'off', // Lots of things are spreadable in discord.js that eslint can't see well

			// Additions
			'@typescript-eslint/explicit-function-return-type': 'error',
			'@typescript-eslint/explicit-member-accessibility': 'error',
			'@typescript-eslint/no-shadow': 'error',
		},
	},

	stylistic.configs['disable-legacy'],
	stylistic.configs.customize({
		braceStyle: '1tbs',
		indent: 'tab',
		semi: true,
	}),
	{
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
		},
	},

	prettierRecommended,

	unicorn.configs.recommended,
	{
		rules: {
			// Handled by Prettier
			'unicorn/no-nested-ternary': 'off',
			'unicorn/number-literal-case': 'off',

			// Overrides
			'unicorn/filename-case': 'off', // We use camelCase
			'unicorn/no-array-callback-reference': 'off',
			'unicorn/no-null': 'off', // We use null
			'unicorn/prefer-spread': 'off',
			'unicorn/prefer-ternary': 'off',
			'unicorn/prevent-abbreviations': 'off',
		},
	},

	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	{
		settings: {
			'import/resolver': {
				typescript: true,
				node: true,
			},
		},
	},

	progress.configs['recommended-ci'],

	promise.configs['flat/recommended']
);
