#!/usr/bin/env ts-node

import './assertTsNode';
import { assert, literal, string, type } from 'superstruct';
import { parser as changelogParser } from 'keep-a-changelog';
import { readFileSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import * as semver from 'semver';

const logger = console;

// Fixes the changelog's footer links and bumps the `version` in [package.json](/package.json) and [package-lock.json](/package-lock.json).
// This script may be run repeatedly on the same project.

const { parse: parseSemVer } = semver;

function quote(str: string | undefined): string | undefined {
	if (str === undefined) return str;
	return `'${str}'`;
}

logger.info('** release.ts **');

// Load the changelog
const here = new URL(__filename, 'file:');
const changelogPath = new URL('../CHANGELOG.md', here).pathname;
const packageJsonPath = new URL('../package.json', here).pathname;
const packageLockJsonPath = new URL('../package-lock.json', here).pathname;
logger.info('Loading changelog from', quote(changelogPath));

const rawChangelog = readFileSync(changelogPath, 'utf-8');
const changelog = changelogParser(rawChangelog);

const releases = changelog.releases;

// Get current versioned release
const thisReleaseIdx = releases.findIndex(release => release.date && release.version);
const thisRelease = releases[thisReleaseIdx];
if (!thisRelease?.version) throw new TypeError('No versioned release was found.');

// Handy info
logger.info('latest release:', thisRelease.version?.toString());

const prevRelease = releases[thisReleaseIdx + 1];
logger.info('previous release:', prevRelease?.version?.toString());

// Fix the changelog's format (new compare links, etc.), and print the diff of our changes
logger.info('\n** Spec compliance **');

changelog.format = 'markdownlint';
const newChangelog = changelog.toString();
writeFileSync(changelogPath, newChangelog);

const didFixChangelog = rawChangelog !== newChangelog;
if (!didFixChangelog) {
	logger.info('Changelog was already spec compliant.');
} else {
	logger.info('Fixed formatting for spec compliance.');
}

// Fix package.json and package-lock.json
logger.info('\n** Version matching **');
const versioned = type({
	version: string(),
});
const versionedLock = type({
	version: string(),
	lockfileVersion: literal(2),
	packages: type({
		'': type({
			version: string(),
		}),
	}),
});

const packageJson: unknown = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const packageLockJson: unknown = JSON.parse(readFileSync(packageLockJsonPath, 'utf-8'));

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
packageJson.version = thisRelease.version.version;
const newPackageJson = `${JSON.stringify(packageJson, undefined, '\t')}\n`;
writeFileSync(packageJsonPath, newPackageJson);

const didFixPackageJson = oldPackageJson !== newPackageJson;
if (!didFixPackageJson) {
	logger.info('package.json already had the correct version.');
} else {
	logger.info('Updated package.json version.');
}

// Update package-lock.json
const oldPackageLockJson = `${JSON.stringify(packageLockJson, undefined, '\t')}\n`;
// Maybe we should just run `npm i` instead?
packageLockJson.version = thisRelease.version.version;
packageLockJson.packages[''].version = thisRelease.version.version;
const newPackageLockJson = `${JSON.stringify(packageLockJson, undefined, '\t')}\n`;
writeFileSync(packageLockJsonPath, newPackageLockJson);

const didFixPackageLockJson = oldPackageLockJson !== newPackageLockJson;
if (!didFixPackageLockJson) {
	logger.info('package-lock.json already had the correct version.');
} else {
	logger.info('Updated package-lock.json version.');
}

// If we fixed the changelog or updated package.json, throw
if (didFixChangelog || didFixPackageJson || didFixPackageLockJson) {
	logger.warn('⚠️  We made some changes. Please review them and re-run. ⚠️');
	process.exit(1); // this should fail us in CI
}
