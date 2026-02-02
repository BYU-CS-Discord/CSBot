// https://github.com/eslint-community/eslint-plugin-promise/issues/488
declare module 'eslint-plugin-promise' {
	import type { Config } from 'eslint/config';
	import type { ESLint } from 'eslint';
	import type { LegacyConfigObject, RulesConfig } from '@eslint/core';
	const plugin: {
		rules: ESLint.Plugin['rules'];
		rulesConfig: RulesConfig;
		configs: {
			recommended: LegacyConfigObject;
			'flat/recommended': Config;
		};
	};
	export default plugin;
}
