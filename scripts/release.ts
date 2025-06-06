#!/usr/bin/env tsx

import './assertTsx.js';

import { parser as changelogParser } from 'keep-a-changelog';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseSemVer } from 'semver';
import { assert, literal, string, type } from 'superstruct';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = console;

// Fixes the changelog's footer links and bumps the `version` in [package.json](/package.json) and [package-lock.json](/package-lock.json).
// This script may be run repeatedly on the same project.

function quote(str: string | undefined): string | undefined {
	if (str === undefined) return str;
	return `'${str}'`;
}

logger.info('** release.ts **');

// Load the changelog
const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const packageJsonPath = path.join(__dirname, '../package.json');
const packageLockJsonPath = path.join(__dirname, '../package-lock.json');
logger.info('Loading changelog from', quote(changelogPath));

const rawChangelog = readFileSync(changelogPath, 'utf8');
const changelog = changelogParser(rawChangelog);

const releases = changelog.releases;

// Get current versioned release
const thisReleaseIdx = releases.findIndex(release => release.date && release.version);
const thisRelease = releases[thisReleaseIdx];
if (!thisRelease?.version) throw new TypeError('No versioned release was found.');

// Handy info
logger.info('latest release:', thisRelease.version);

const prevRelease = releases[thisReleaseIdx + 1];
logger.info('previous release:', prevRelease?.version);

// Fix the changelog's format (new compare links, etc.), and print the diff of our changes
logger.info('\n** Spec compliance **');

changelog.format = 'markdownlint';
const newChangelog = changelog.toString();
writeFileSync(changelogPath, newChangelog);

const didFixChangelog = rawChangelog !== newChangelog;
if (didFixChangelog) {
	logger.info('Fixed formatting for spec compliance.');
} else {
	logger.info('Changelog was already spec compliant.');
}

// Fix package.json and package-lock.json
logger.info('\n** Version matching **');
const versioned = type({
	version: string(),
});
const versionedLock = type({
	version: string(),
	lockfileVersion: literal(3),
	packages: type({
		'': type({
			version: string(),
		}),
	}),
});

const packageJson: unknown = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const packageLockJson: unknown = JSON.parse(readFileSync(packageLockJsonPath, 'utf8'));

assert(packageJson, versioned);
assert(packageLockJson, versionedLock);

const packageVersion = parseSemVer(packageJson.version);
const packageLockVersion = parseSemVer(packageLockJson.version);

if (!packageVersion) {
	throw new TypeError(
		'The "version" field in package.json is not a compliant Semantic Version number'
	);
}

if (!packageLockVersion) {
	throw new TypeError(
		'The "version" field in package-lock.json is not a compliant Semantic Version number'
	);
}

logger.info('package.json version:', packageVersion.version);
logger.info('package-lock.json version:', packageLockVersion.version);

if (packageVersion.version !== packageLockVersion.version) {
	throw new EvalError(
		'The "version" fields in package.json and package-lock.json do not match. Please let CHANGELOG.md be the source of truth for versioning. To ignore this warning and proceed, please first run `npm install`.'
	);
}

// Update package.json
const oldPackageJson = `${JSON.stringify(packageJson, undefined, '\t')}\n`;
packageJson.version = thisRelease.version;
const newPackageJson = `${JSON.stringify(packageJson, undefined, '\t')}\n`;
writeFileSync(packageJsonPath, newPackageJson);

const didFixPackageJson = oldPackageJson !== newPackageJson;
if (didFixPackageJson) {
	logger.info('Updated package.json version.');
} else {
	logger.info('package.json already had the correct version.');
}

// Update package-lock.json
const oldPackageLockJson = `${JSON.stringify(packageLockJson, undefined, '\t')}\n`;
// Maybe we should just run `npm i` instead?
packageLockJson.version = thisRelease.version;
packageLockJson.packages[''].version = thisRelease.version;
const newPackageLockJson = `${JSON.stringify(packageLockJson, undefined, '\t')}\n`;
writeFileSync(packageLockJsonPath, newPackageLockJson);

const didFixPackageLockJson = oldPackageLockJson !== newPackageLockJson;
if (didFixPackageLockJson) {
	logger.info('Updated package-lock.json version.');
} else {
	logger.info('package-lock.json already had the correct version.');
}

// If we fixed the changelog or updated package.json, throw
if (didFixChangelog || didFixPackageJson || didFixPackageLockJson) {
	logger.warn('⚠️  We made some changes. Please review them and re-run. ⚠️');
	process.exit(1); // this should fail us in CI
}
