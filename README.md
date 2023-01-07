# CSBot

(Proper name TBD)

> This project is undergoing rapid development and should be considered experimental. Use it at your own risk. 🤙

A bot to help manage the activities and community of BYU's Computer Science Discord server.

This project is meant as a successor to [Ze-Kaiser](https://github.com/ArkenStorm/Ze-Kaiser), whose original contributors are as follows, in alphabetical order:

- [**ArkenStorm**](https://github.com/ArkenStorm)
- [**Carterworks**](https://github.com/Carterworks)
- [**EmmaChase**](https://github.com/EmmaChase)
- [**TheZealotAlmighty**](https://github.com/TheZealotAlmighty)

## Authors & Contributors

These users contributed various things over time directly to this codebase. This list is ordered roughly by when users first contributed code. We add to this list as people contribute.

- [**ZYancey**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3Azyancey) ([profile](https://github.com/zyancey))
- [**gmacgre**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3Agmacgre) ([profile](https://github.com/gmacgre))
- [**JstnMcBrd**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3AJstnMcBrd) ([profile](https://github.com/JstnMcBrd))
- [**AverageHelper**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3AAverageHelper) ([profile](https://github.com/AverageHelper))
- [**SpencerHastings**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3ASpencerHastings) ([profile](https://github.com/SpencerHastings))
- [**Plyb**](https://github.com/BYU-CS-Discord/CSBot/pulls?q=is%3Apr+is%3Amerged+author%3APlyb) ([profile](https://github.com/Plyb))

## Contributing

This project is entirely open-source. Do with it what you will. If you're willing to help us improve this project, consider [filing an issue](https://github.com/BYU-CS-Discord/CSBot/issues/new/choose).

See [CONTRIBUTING.md](/CONTRIBUTING.md) for ways to contribute.

## License

This project's source is licensed under the [Unlicense](LICENSE) license. All contributions to this project's source are understood to be given to the public domain.

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
    - [Run the bot](#run-the-bot)

## Chat Input Commands

You can find these in Discord by typing `/` in the message input box in any channel where you're allowed to run commands.

### /help

Prints some info about the bot, including the current running version and a link to the code repository.

### /profile

Retrieves the profile picture of the given user.

### /xkcd

Retrieves the most recent [xkcd](https://xkcd.com/) comic, or the given one.

### /talk

Uses the [dectalk](https://github.com/babakinha/dectalk) text-to-speech engine to speak the message you give it,
either sending a .wav file in a text channel or talking out loud in a voice channel. Comes with 9 different voices.

## Context Menu Commands

You can find these in Discord by invoking the context menu on any message in any channel where you're allowed to run commands.

### Fix Twitter Links

Transforms [twitter.com](https://twitter.com/) links in the given message to [FixTweet](https://github.com/FixTweet/FixTweet) links in an ephemeral reply. Please use fxtwitter in your own messages, especially when the tweet is a video. Twitter's default embed stinks on some platforms.

### Talk

Performs the same function as the `/talk` chat input command, but uses the selected message as input.
Can be used to repeat the same 'talk' command without typing it out again.

## Usage or Development

If you've read this far, and don't plan to run or develop on the bot yourself, or are not curious how to do so, you may leave now. This part is quite boring. But feel free to read on anyway!

### Prerequisites

This project requires [NodeJS](https://nodejs.org/) (version 16.10 or later), [NPM](https://npmjs.org/). To make sure you have them available on your machine, try running the following command:

```sh
$ npm -v && node -v
7.20.3
v16.15.1
```

This project also requires [Docker](https://www.docker.com/). Docker runs the project in a lightweight virtual Linux environment, so functionality will be identical on any operating system.

All Docker management (like building, running, and cleaning up images and containers) has been automated, so you only have to follow a few simple steps.

You must install Docker before continuing. To make sure Docker is available on your machine, run the following command:

```sh
$ docker -v
Docker version 20.10.17, build 100c701
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

Create a file called `.env` in the root of this project folder. Paste your token into that file, and fill in other config items as desired:

```sh
# .env

DISCORD_TOKEN=YOUR_TOKEN_GOES_HERE
# required, token for your Discord bot

DATABASE_URL=YOUR_DATABASE_URL_GOES_HERE
# required for any DB functionality, we will get this URL in a later section

ADMINISTRATORS=COMMA,SEPARATED,ID,LIST
# Required for the update command. WARNING: The users whose ids are listed here will be able to pull, build, and run code from this repository on the machine the bot is running on. Do not include any users you do not trust.
```

**Do not commit this file to git** or your bot _will_ get "hacked".

### Invite your bot to your server

Go to https://discordapi.com/permissions.html#378091424832 and paste in your bot's client ID to get an invite link.

### Setting up Docker

Now you are ready to set up your development environment. Set up Docker by running the following command:

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

_As we use prisma for managing our DB it is up to you what relational database framework you use._

[The following is a guide to setting up Postgres inside a docker container.](https://github.com/docker-library/docs/blob/master/postgres/README.md) While the choice of database is up to you, the instructions for getting started in this guide assume you are using a postgres docker image.

After you have Postgres (or your DB of choice) up and running, edit this line in your `.env` file:

```
DATABASE_URL=postgres://{pg_user}:{pg_pass}@{pg_hostname}:{pg_port}/{pg_db}
# required for any DB functionality, we will get this URL in a later section
```

- pg_user = The Username you set in your POSTGRES_USER environment variable (default postgres)
- pg_pass = The Password you set in your POSTGRES_PASS environment variable (default postgres)
- ph_host = The IP of the server running your Postgres instance (default localhost)
- pg_port = The Port assigned to your Postgres instance (default 5432)
- pg_db = The Name of the database you wish to use for the bot

The first time you run this project, you should run the following command to initialize the database:

```
$ npm run baseline
```

Migrations can be run on the Database with the following command:

```
$ npm run prisma:migrate
```

### Register Slash Commands

If you want support for Discord [Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ), you'll need to deploy the commands directly. To avoid rate limits, use a command-line tool, rather than deploying on startup.

Once you have your bot's account token in the .env file, run the following command to tell Discord about our commands:

```sh
$ npm run commands:deploy
```

### Run the bot

For development purposes (the update command will not work properly, but logs are output to the console):

```sh
$ node .
# or
$ npm run dev
```

For production purposes:

```sh
npm start
```
