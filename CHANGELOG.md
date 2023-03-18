# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.7.1 - 2023-03-17
### Changed
- Replies from `/findroom` are now sent ephemerally.

## 0.7.0 - 2023-01-07
### Added
- New option autocomplete feature for commands.
- A new `/sendtag` command for testing purposes.
- New button functionality for interactions.
- A new `/update` command to pull the latest changes and restart the bot.
- A new `/tothegallows` command to start a game of evil hangman.

### Changed
- README organization.

## 0.6.1 - 2022-12-10
### Added


## 0.6.0 - 2022-12-03
### Added
- A new `/talk` command has been added - uses the [dectalk](https://github.com/babakinha/dectalk) TTS engine to speak a given message.
- A new `Talk` context menu command has been added - also uses dectalk to speak any message users right-click on.

### Changed
- The error reporting system for commands has also been standardized.

## 0.5.2 - 2022-12-02
### Changed
- New safety guards for the `/profile` command.

## 0.5.1 - 2022-11-29
### Changed
- Use the new-and-improved [FixTweet](https://github.com/FixTweet/FixTweet) instead of ye olde [BetterTwitFix](https://github.com/dylanpdx/BetterTwitFix).
- Our development environment is now standardized with Docker.

## 0.5.0 - 2022-10-13
### Added
- We now join in on the server community by sharing reactions (mostly randomly). The default :star: emoji is ignored, in the interest of future features. :same: and :no_u: emoji are reciprocated 1 in 5 times, and every other emote is reciprocated 1 in 100 times.

## 0.4.0 - 2022-10-13
### Added
- A message context menu command to fix Twitter links using vxtwitter.

## 0.3.0 - 2022-10-02
### Added
- The `/profile` command now returns the profile picture for a specified user.

## 0.2.0 - 2022-10-01
### Added
- Request a comic from the XKCD api with `/xkcd <number>`.

## 0.1.3 - 2022-09-30
### Added
- Notice in the bot's user profile to do `/help` for bot info.

### Changed
- The `/help` command no longer lists any commands itself. It now directs users to  try Discord's own Slash Commands UI.
- Moved the repo URL from the bot's profile (where it was largely inaccessible anyway) to the `/help` output.

## 0.1.2 - 2022-09-29
### Added
- We now check the command deployments on startup. If the deployed command names differ from the known ones, that means we missed a deployment.

### Changed
- Reorganized command contexts for better ergonomics and maintainability.

## 0.1.1 - 2022-09-28
### Changed
- The `/help` command now lists all commands.

## 0.1.0 - 2022-09-27
### Added
- Development Environment for needed dependencies.
