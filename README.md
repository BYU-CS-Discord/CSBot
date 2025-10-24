# CSBot

> This project is currently in active development and should be considered experimental. Use it at your own risk. 🤙

A bot to help manage the activities and community of BYU's Computer Science Discord server.

This project is meant as a successor to [Ze-Kaiser](https://github.com/ArkenStorm/Ze-Kaiser), whose original contributors are as follows, in alphabetical order:

- [**ArkenStorm**](https://github.com/ArkenStorm)
- [**Carterworks**](https://github.com/Carterworks)
- [**EmmaChase**](https://github.com/EmmaChase)
- [**TheZealotAlmighty**](https://github.com/TheZealotAlmighty)

A read-only code mirror for this project exists [on Codeberg](https://codeberg.org/BYU-CS-Discord/CSBot/).

## Authors & Contributors

These users contributed various things over time directly to this codebase. This list is ordered roughly by when users first contributed code. We add to this list as people contribute.

- [**ZYancey**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3Azyancey) ([profile](https://github.com/zyancey))
- [**gmacgre**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3Agmacgre) ([profile](https://github.com/gmacgre))
- [**JstnMcBrd**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3AJstnMcBrd) ([profile](https://github.com/JstnMcBrd))
- [**AverageHelper**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3AAverageHelper) ([profile](https://github.com/AverageHelper))
- [**SpencerHastings**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3ASpencerHastings) ([profile](https://github.com/SpencerHastings))
- [**Plyb**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3APlyb) ([profile](https://github.com/Plyb))
- [**TStansel**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Amerged+is%3Apr+author%3ATStansel) ([profile](https://github.com/TStansel))
- [**josephgeis**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Amerged+is%3Apr+author%3Ajosephgeis) ([profile](https://github.com/josephgeis))

## Contributing

This project is entirely open-source. Do with it what you will. If you're willing to help us improve this project, consider [filing an issue](https://github.com/BYU-CS-Discord/CSBot/issues/new/choose).

See [CONTRIBUTING.md](/CONTRIBUTING.md) for ways to contribute.

## License

This project's source is licensed under the [BSD Zero Clause License](LICENSE). All contributions to this project's source may be used, copied, modified, and/or distributed for any purpose.

## Table of contents

- [CSBot](#csbot)
  - [Authors & Contributors](#authors--contributors)
  - [Contributing](#contributing)
  - [License](#license)
  - [Table of contents](#table-of-contents)
  - [Commands](#commands)
  - [Usage or Development](#usage-or-development)
    - [Prerequisites](#prerequisites)
    - [Clone the Repo](#clone-the-repo)
    - [Get your own bot token](#get-your-own-bot-token)
    - [Configure the bot](#configure-the-bot)
    - [Invite your bot to your server](#invite-your-bot-to-your-server)
    - [Important Note for Windows Users](#important-note-for-windows-users)
    - [Build the bot](#build-the-bot)
    - [Build the bot database](#build-the-bot-database)
    - [Register Slash Commands](#register-slash-commands)
    - [Test the bot](#test-the-bot)
    - [Run the bot](#run-the-bot)

## Chat Input Commands

You can find these in Discord by typing `/` in the message input box in any channel where you're allowed to run commands.

### /emoji

Retrieves the internal picture for a custom emoji. By default responds ephemerally but when provided with a `false` boolean it responds so everyone can see the returned picture.

### /findroom ( now / at / between / when )

Searches for available classrooms on BYU Campus using real-time schedule data. Built with native TypeScript and features automatic retry logic for reliable data fetching.

- **now** - Find rooms available right now
- **at** - Find rooms available at a specific time and day(s)
- **between** - Find rooms available during a time range on specific day(s)
- **when** - Check when a specific room is next available

The room finder automatically updates its database every Sunday at 2 AM to stay current with the semester schedule.

### /help

Prints some info about the bot, including the current running version and a link to the code repository.

### /iscasdown

Checks whether BYU's CAS system is operational, because it crashes fairly often.

### /profile

Retrieves the profile picture of the given user.

### /scraperooms

**[Admin Only]** Manually triggers the room finder data scraper to update the database with current semester schedule information. This is useful for forcing an immediate update without waiting for the automatic Sunday schedule. Takes 10-15 minutes to complete and runs in the background. Shows real-time progress if a scrape is already running.

### /setreactboard

Creates a new reactboard or updates an existing one. A reactboard is a channel where the bot will repost messages that recieve a specified number of a specified reaction. The primary use is for a starboard where messages that receive the right number of stars will be added, along with how many stars they received.

### /smite

Temporarily prevents a user from using bot commands for one hour. Only administrators can successfully use this command - non-admins who attempt to use it will be smitten for 60 seconds. Administrators cannot be smitten, and attempting to smite the bot will result in the executor being smitten instead. Users who smite themselves receive a special response.

### /stats ( track / update / list / leaderboard / untrack )

Tracks a statistic for the issuer. Use the `track` subcommand to begin tracking, `update` to add or subtract to it, `list` to show all the stats being tracked for the issuer, `leaderboard` to show the users with the highest scores for a stat, and `untrack` to stop tracking a stat for you.

### /tag ( add / send / preview / list / remove )

Manage and use tagged images and links within your server. Tags are server-specific and tracked with usage statistics.

- **add** - Create a new tag with a name and content (URL or text). Maximum 100 characters for name, 2000 for content.
- **send** - Post a tag publicly in the channel. Automatically displays images as embeds.
- **preview** - View tag details privately (ephemeral), including creator, use count, and creation date.
- **list** - List all available tags in the server with their creators and use counts.
- **remove** - Delete a tag you created. Admins can delete any tag.

Tag names support autocomplete for easy discovery.

### /talk

Uses the [dectalk](https://github.com/JstnMcBrd/dectalk-tts) text-to-speech engine to speak the message you give it, either sending a .wav file in a text channel or talking out loud in a voice channel. Comes with 9 different voices.

By using this command, you are acknowleding that your input will be sent to a third-party web API, which may use your information however it wants. Please see [this disclaimer](https://github.com/JstnMcBrd/dectalk-tts#about).

### /tothegallows

Begins a new game of Evil Hangman.

### /unsmite

**[Admin Only]** Removes the smite status from a user, restoring their ability to use bot commands immediately.

### /xkcd

Retrieves the most recent [xkcd](https://xkcd.com/) comic, or the given one.

## Context Menu Commands

You can find these in Discord by invoking the context menu (right-clicking) on any message in any channel where you're allowed to run commands.

### Alt Text

Prints the alt text attached to any images included in the message you use it on.

### Fix Twitter/X Links

Transforms [twitter.com](https://twitter.com/) and [x.com](https://x.com/) links in the given message to [FxTweet/FixupX](https://github.com/FixTweet/FxTwitter) links in an ephemeral reply. Please use fxtwitter/fixupx in your own messages, especially when the tweet is a video. The default embed stinks on some platforms.

### Talk

Performs the same function as the `/talk` chat input command, but uses the selected message as input.
Can be used to repeat the same 'talk' command without typing it out again.

---

## Automatic Features

### AutoMod Response

The bot automatically monitors Discord's AutoMod system and responds when messages are blocked for profanity or custom keyword violations. When a user's message is deleted by AutoMod due to banned words, the bot will:

- Post a lighthearted "Tsk tsk" message mentioning the user
- Display a humorous image

This feature works automatically with your server's existing AutoMod rules - no configuration needed. It only responds to keyword-based message deletions (profanity filters and custom word lists).

---

### Uptime

The bot automatically pings an uptime monitor every 5 minutes to keep the server running. This is configured in the `.env` file.

## Usage or Development

If you've read this far, and don't plan to run or develop on the bot yourself, or are not curious how to do so, you may leave now. This part is quite boring. But feel free to read on anyway!

### Prerequisites

This project requires [NodeJS](https://nodejs.org/) (version 18.17 or later) and [NPM](https://npmjs.org/). To make sure you have them available on your machine, try running the following command:

```sh
$ node -v && npm -v
v18.17.1
9.6.7
```

If you don't want to install Node or any other dependencies on your machine, you may also use [Docker](https://www.docker.com/). Docker runs the project in a lightweight virtual Linux environment will all dependencies pre-installed, so functionality will be identical on any operating system.

All Docker management (like building, running, and cleaning up images and containers) has been automated, so you only have to follow a few simple steps.

You can install Docker from their website linked above. To make sure Docker is available on your machine, run the following command:

```sh
$ docker -v
Docker version 20.10.22, build 3a2c30b
```

### Clone the Repo

```sh
$ cd path/to/parent
$ git clone https://github.com/BYU-CS-Discord/CSBot.git
$ cd CSBot
```

### Get your own bot token

Note that, by running this bot, you agree to be bound by the Discord's [Developer Terms of Service](https://support-dev.discord.com/hc/en-us/articles/8562894815383) and [Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327), as well as [this project's own license](/LICENSE). With that in mind, you'll need a token for a Discord bot account. See [this awesome tutorial on how to get one](https://www.howtogeek.com/364225/how-to-make-your-own-discord-bot/).

### Configure the bot

This section only applies if running directly from source. See [Run the bot](#run-the-bot) for how to configure for running in [Podman](https://podman.io/) or [Docker](https://www.docker.com/).

Create a file called `.env` in the root of this project folder. Paste your token into that file, and fill in other config items as desired:

```sh
# .env

# Required; token for your Discord bot
DISCORD_TOKEN='xxx'

# Required; facilitates DB functionality, we will get this URL in a later section
DATABASE_URL='file:/path/to/your/database.db'

# Optional; a URL to GET periodically, e.g. an uptime-kuma Push Monitor
UPTIME_URL='https://status.example.com/api/push/xxx?status=up'

# Optional; the number of seconds between calls to `UPTIME_URL` Must be at least 15. Defaults to `300`
UPTIME_INTERVAL_SECONDS=300
```

**Do not commit this file to git** or your bot _will_ get "hacked".

### Invite your bot to your server

Go to https://discordapi.com/permissions.html#379165174848 and paste in your bot's client ID to get an invite link.

### Setting up Docker

> **Highly Recommended!**
>
> If you are using [Visual Studio Code](https://code.visualstudio.com/), you can use the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension, which will run the whole project in the Docker container. If you choose to do so, you can ignore every Docker instruction after this. Very nifty!

If you wish to run the project in Docker, use the following command before continuing:

```sh
$ npm run docker
```

This will build a simple Linux image, start a container of that image, and then mount the project folder into the container.

Once the container is started, you will see your command prompt change. You are now in a virtual Linux environment. If you run `ls`, you will see all the project files. Any changes you make to these files are synced between your local computer and the container.

Now that your command line is in the Docker container, you can run any part of the project and develop without worrying about compatibility.

To close the container, simply run `exit`. To start a new container, use `npm run docker` again. Every time you open the project, you should start a container before developing.

The docker script will take care of every part of the docker development process, including building, running, and cleaning up, so you only need to worry about a single command.

### Build the bot

Be sure to install dependencies, run a quick lint to generate needed files, compile the source, and deploy commands. Here's a handy command to do all of that:

```sh
$ npm run setup
```

### Build the bot database

CSBot uses SQLite. All persistent data is stored in a single file.

If you're running in Docker, the database file will be created for you, at the path specified in your volume config. If the database is found, any pending database migrations will be run on startup. (See [docker-compose.yml](docker-compose.yml).) Otherwise, you'll need to configure the database URL and initialize it yourself, as described below.

First decide where you want your database file to go, then edit this line in your `.env` file:

```
DATABASE_URL=file:/path/to/your/database.db
```

The first time you run this project, you should run the following command to initialize the database at the configured path:

```
$ npm run db:init
```

Migrations can be run on the database with the following command:

```
$ npm run db:migrate
```

### Register Slash Commands

If you want support for Discord [Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ), you'll need to deploy the commands directly. To avoid rate limits, use a command-line tool, rather than deploying on startup.

Once you have your bot's account token in the .env file, run the following command to tell Discord about our commands:

```sh
$ npm run commands:deploy
```

### Test the bot

Whenever you make changes, you should make sure to run all unit tests before submitting.

```sh
$ npm run test
```

If you have added new code, you should write new unit tests to cover all the code you've written. Our goal is 100% code coverage.

### Run the bot

For development purposes:

```sh
$ node --env-file=.env .
# or
$ npm run dev
```

For production purposes, consider using [Podman](https://podman.io/) or [Docker](https://www.docker.com/) Compose. Copy the example [docker-compose.yml](docker-compose.yml) file to your system, and configure it accoring to your setup. Pay special attention to:

- Use the `build` field if you've cloned this repo directly to build the image from source. Use the `image` field instead if you wish to use our published image.
- Configure the `volumes` secion appropriately. By default, the SQLite database will go in an adjacent directory to your compose file. If you want the data to live somewhere else on your system, change the configuration accordingly.
- Create a `.env` file adjacent to your compose file and populate it with your Discord bot token, like so:

```sh
DISCORD_TOKEN=YOUR_TOKEN_HERE
```

Alternatively, you can run directly like so:

```sh
$ npm start
$ npm run stop
$ npm run restart
```

This will spawn a separate thread using [PM2](https://pm2.io/) that will run in the background.
