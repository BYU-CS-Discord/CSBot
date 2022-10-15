# Set up the basic operating system
FROM node:16.18.0 AS os
RUN apt-get update
RUN apt-get upgrade --yes
ENTRYPOINT [ "bash" ]
# Bash is just a temporary entrypoint, in case you wanted to build the project at this stage for some reason.

# Copy the project into the docker container
FROM os AS project
# Hopefully installing node dependencies before copying project files
# will allow Docker to reuse more of the build cache
WORKDIR /cs-bot
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run export-version
ENTRYPOINT [ "bash" ]
# Bash is just a temporary entrypoint, in case you wanted to build the project at this stage for some reason.

# Test the project
FROM project AS test
RUN npm run lint
ENTRYPOINT npm run test

# Build the project
FROM project AS build
RUN npm run build
ENTRYPOINT [ "bash" ]

# Deploy commands
FROM build AS commands-deploy
ENTRYPOINT npm run commands:deploy

# Revoke commands
FROM build AS commands-revoke
ENTRYPOINT npm run commands:revoke

# Start the bot
FROM build AS start
ENTRYPOINT npm run start