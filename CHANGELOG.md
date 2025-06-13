# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.14.3] - 2025-06-12

### Fixed

- Don't allow reactboard reactions on the bot's own messages.
- Only send one error message if someone sends a bad reactboard react.

## [0.14.2] - 2025-06-12

### Fixed

- Removed Postgres migrations to fix reboot loop against the SQLite database.

## [0.14.1] - 2025-06-12

### Fixed

- Export the `setReactboard` command
- Automatic deployment of SemVer tags for our Docker image should now work.

## [0.14.0] - 2025-06-12

### Added

- Starboard, and associated commands

## [0.13.2] - 2024-10-03

### Changed

- Nothing. Just triggering a CI run for science.

## [0.13.1] - 2024-10-03

### Added

- Deploy Docker image tags for specific SHA hashes.

## [0.13.0] - 2024-10-03

### Added

- `/iscasdown` slash command to check if BYU's CAS is working
- Node built-in `.env` file support
- Automatic updates for dependencies with Dependabot
- A read-only code mirror on [Codeberg](https://codeberg.org/BYU-CS-Discord/CSBot/)
- Docker support in production!

### Changed

- BREAKING: Node version to 20 LTS
- BREAKING: Use SQLite instead of PostgreSQL for simplicity and ease of transferring data between hosts.
- Tests to use `vitest` instead of `jest`
- TypeScript build settings to be simplified and and follow `typescript-eslint` standards
- ESLint config to use new flat configuration
- ESLint config to use new stylistic packages
- Package lockfile to version 3
- "Fix Twitter Links" to support alternative [x.com](https://x.com) links
- GitHub workflows to be revamped
- Project to use ESM instead of CommonJS
- `package.json` to be sorted using `npx sort-package-json`
- Release script to use `tsx` instead of `ts-node` to resolve ESM problems
- `/talk` to use `dectalk-tts` package instead of `dectalk`

### Removed

- BREAKING: All previous automatic database migrations were removed, because Prisma cannot automatically migrate between database providers. Be sure to upgrade to v0.12.1 before using this version, as any data you might have had won't be migrated for you. See [this migration guide](https://web.archive.org/web/20231216021706/https://serverfault.com/questions/274355/how-to-convert-a-postgres-database-to-sqlite/276213#276213) for help migrating your existing database. Future migrations in SQLite will happen on startup.
- BREAKING: Removed `/update`. Use Docker instead for easy upgrades.

### Fixed

- All package vulnerabilities
- Buildings being used as choices for `end_time` option of `/findroom between` command

## [0.12.1] - 2023-10-05

### Fixed

- Bug where uncached users in a leaderboard throws an error

## [0.12.0] - 2023-08-18

### Changed

- Updated engine requirement to Node 18. This is a breaking change, as the update process may not be as simple as running `/update`.
- Use built-in `fetch` at runtime, instead of `undici`.

## [0.11.2] - 2023-07-07

### Changed

- Use `undici` instead of `axios` for network requests.
- Log HTTP status text when encountering non-200 statuses.
- Properly guard API boundaries against type poisoning.

## [0.11.1] - 2023-06-28

### Changed

- Made some internal structures read-only, to enforce interface contracts at compile time and reduce some cases of array duplication.
- Straightened out internal circular dependencies, in preparation for Rollup build and ESM.

## [0.11.0] - 2023-05-31

### Added

- New context menu command to retrieve the image descriptions (alt text) for a given message's attachments.

## [0.10.1] - 2023-04-13

### Fixed

- Bug where `/stats list` would throw an error if the user wasn't tracking anything

## [0.10.0] - 2023-04-06

### Added

- A new `/stats` command for stats tracking and competition

## [0.9.2] - 2023-04-05

### Fixed

- Updated discord.js to v14.9.0. Fixes button interactions not responding.

## [0.9.1] - 2023-03-31

### Changed

- Updated most dependencies.

## [0.9.0] - 2023-03-30

### Added

- A new `/emoji` command to retrieve the internal image used for a custom emoji.

## [0.8.3] - 2023-03-17

### Changed

- Improved formatting of interaction error output.

### Fixed

- Typo in interaction error output.

## [0.8.2] - 2023-03-17

### Changed

- Replies from `/findroom` are now sent ephemerally.

### Fixed

- Command crash when processing options for certain commands.

## [0.8.1] - 2023-03-16

### Added

- Custom errors types for `/update` command.

## [0.8.0] - 2023-03-08

### Added

- A new `/findroom` command for searching available rooms on campus.

## [0.7.1] - 2023-02-04

### Added

- GitHub workflow stages for export-version and linting.
- VS Code devcontainer setup.
- README sections on testing and devcontainers.

### Changed

- Updated node versioning across the project.
- Simplified npm scripts to be more intuitive.
- Docker is now optional.

### Fixed

- Bug where replied interactions couldn't report errors.
- Missing "git" dependency for `/update` command in Docker container.

## [0.7.0] - 2023-01-07

### Added

- New option autocomplete feature for commands.
- A new `/sendtag` command for testing purposes.
- New button functionality for interactions.
- A new `/update` command to pull the latest changes and restart the bot.
- A new `/tothegallows` command to start a game of evil hangman.

### Changed

- README organization.

## [0.6.1] - 2022-12-10

### Added

- Infrastructure to handle static autocomplete options.

## [0.6.0] - 2022-12-03

### Added

- A new `/talk` command has been added - uses the [dectalk](https://github.com/babakinha/dectalk) TTS engine to speak a given message.
- A new `Talk` context menu command has been added - also uses dectalk to speak any message users right-click on.

### Changed

- The error reporting system for commands has also been standardized.

## [0.5.2] - 2022-12-02

### Changed

- New safety guards for the `/profile` command.

## [0.5.1] - 2022-11-29

### Changed

- Use the new-and-improved [FixTweet](https://github.com/FixTweet/FixTweet) instead of ye olde [BetterTwitFix](https://github.com/dylanpdx/BetterTwitFix).
- Our development environment is now standardized with Docker.

## [0.5.0] - 2022-10-13

### Added

- We now join in on the server community by sharing reactions (mostly randomly). The default :star: emoji is ignored, in the interest of future features. :same: and :no_u: emoji are reciprocated 1 in 5 times, and every other emote is reciprocated 1 in 100 times.

## [0.4.0] - 2022-10-13

### Added

- A message context menu command to fix Twitter links using vxtwitter.

## [0.3.0] - 2022-10-02

### Added

- The `/profile` command now returns the profile picture for a specified user.

## [0.2.0] - 2022-10-01

### Added

- Request a comic from the XKCD api with `/xkcd <number>`.

## [0.1.3] - 2022-09-30

### Added

- Notice in the bot's user profile to do `/help` for bot info.

### Changed

- The `/help` command no longer lists any commands itself. It now directs users to try Discord's own Slash Commands UI.
- Moved the repo URL from the bot's profile (where it was largely inaccessible anyway) to the `/help` output.

## [0.1.2] - 2022-09-29

### Added

- We now check the command deployments on startup. If the deployed command names differ from the known ones, that means we missed a deployment.

### Changed

- Reorganized command contexts for better ergonomics and maintainability.

## [0.1.1] - 2022-09-28

### Changed

- The `/help` command now lists all commands.

## [0.1.0] - 2022-09-27

### Added

- Development Environment for needed dependencies.

[0.14.3]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.14.2...v0.14.3
[0.14.2]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.13.2...v0.14.0
[0.13.2]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.13.1...v0.13.2
[0.13.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.11.2...v0.12.0
[0.11.2]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.11.1...v0.11.2
[0.11.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.10.1...v0.11.0
[0.10.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.9.2...v0.10.0
[0.9.2]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.8.3...v0.9.0
[0.8.3]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.8.2...v0.8.3
[0.8.2]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.5.2...v0.6.0
[0.5.2]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/BYU-CS-Discord/CSBot/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/BYU-CS-Discord/CSBot/releases/tag/v0.1.0
