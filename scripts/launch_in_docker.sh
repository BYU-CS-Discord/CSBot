#!/bin/bash
DATABASE_FILENAME="$(echo $DATABASE_URL | sed "s/file://g")"
if [[ ! -f $DATABASE_FILENAME ]] ; then
	echo "No database detected, initializing..."
	npm run db:init
else
	echo "Database found! Running migrations..."
	npm run db:migrate
fi
node . --deploy
node .
