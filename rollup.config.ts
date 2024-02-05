import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';
import analyze from 'rollup-plugin-analyzer';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const HOME = process.env['HOME'];
const NODE_ENV = process.env['NODE_ENV'];

export default defineConfig({
	plugins: [
		// Prisma injects the home directory. Remove that:
		HOME === undefined
			? null
			: replace({
					values: {
						[HOME]: '~',
					},
					delimiters: ['', ''],
					preventAssignment: true,
				}),

		// Check types
		typescript({
			tsconfig: './tsconfig.prod.json',
		}),

		// Transpile source
		esbuild({
			tsconfig: './tsconfig.prod.json',
			sourceMap: true,
			minify: NODE_ENV === 'production',
		}), // TS ~> JS
		commonjs({ transformMixedEsModules: true }), // CJS ~> ESM
		json(), // JSON ~> JS

		// Find external dependencies
		nodeResolve({
			exportConditions: ['node'],
			preferBuiltins: true,
		}),

		// Generate build statistics
		analyze({
			filter: () => false, // only top-level summary
		}),
		visualizer(),
	],
	onwarn(warning, defaultHandler) {
		// Ignore "`this` has been rewritten to `undefined`" warnings.
		// They usually relate to modules that were transpiled from
		// TypeScript, and check their context by querying the value
		// of global `this`.
		if (warning.code === 'THIS_IS_UNDEFINED') return;

		// Ignore certain "Use of eval is strongly discouraged" warnings.
		// These `eval` calls are fairly tame, though this should
		// be audited with each update.
		const evalWhitelist = ['@prisma/client', 'discord.js'];
		if (warning.code === 'EVAL' && evalWhitelist.some(e => warning.loc?.file?.includes(e))) return;

		// 'glob' is ostensibly fixed in its v9 release. See https://github.com/isaacs/node-glob/issues/365#issuecomment-375408306.
		const circularWhitelist = ['glob', 'discord.js'];
		if (
			warning.code === 'CIRCULAR_DEPENDENCY' &&
			circularWhitelist.some(e => warning.message.includes(e))
		) {
			return;
		}

		defaultHandler(warning);
	},
	external: [
		// Uses globalThis in a way that breaks bundle at runtime
		'discord.js',

		// Relies on __dirname in a way that ESBuild cannot translate
		'@prisma/client',
	],
	input: 'src/main.ts',
	output: {
		file: 'dist/main.js',
		format: 'esm',
		sourcemap: 'inline',
	},
});
