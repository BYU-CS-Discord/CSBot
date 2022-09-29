# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
