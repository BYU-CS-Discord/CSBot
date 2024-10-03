#!/usr/bin/env bash

# Fail early on nonzero exit
set -euo pipefail

# Prepare database
DATABASE_FILENAME="$(echo $DATABASE_URL | sed "s/file://g")"
if [[ -f "$DATABASE_FILENAME" ]] ; then
	echo "Database found! Running migrations..."
	npm run db:migrate
else
	echo "No database detected, initializing..."
	npm run db:init
fi

# Deploy commands
node . --deploy

# Launch
node .
