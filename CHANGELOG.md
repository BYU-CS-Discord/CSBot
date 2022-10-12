# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.4.0 - 2022-10-11
### Added
- A message context menu command to fix Twitter links using vxtwitter

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
