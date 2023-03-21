/* eslint-disable import/no-default-export */

import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';
import analyze from 'rollup-plugin-analyzer';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
	plugins: [
		// Transpile source
		typescript({
			tsconfig: './tsconfig.prod.json',
			sourceMap: true,
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
	external: [
		// Circular, uses eval
		'discord.js',

		// Circular
		'glob',
		'yargs',
	],
	input: 'src/main.ts',
	output: {
		file: 'dist/main.js',
		format: 'cjs',
		sourcemap: 'inline',
	},
});
