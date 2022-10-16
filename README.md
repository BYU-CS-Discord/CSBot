# CSBot

(Proper name TBD)

> This project is undergoing rapid development and should be considered experimental. Use it at your own risk. 🤙

A bot to help manage the activities and community of BYU's Computer Science Discord server.

This project is meant as a successor to [Ze-Kaiser](https://github.com/ArkenStorm/Ze-Kaiser), whose original contributors are as follows:

- [**ArkenStorm**](https://github.com/ArkenStorm)
- [**Carterworks**](https://github.com/Carterworks)
- [**EmmaChase**](https://github.com/EmmaChase)
- [**TheZealotAlmighty**](https://github.com/TheZealotAlmighty)

## Authors & Contributors

This list is updated as contributors contribute.

- [**ZYancey**](https://github.com/zyancey)
- [**gmacgre**](https://github.com/gmacgre)
- [**JstnMcBrd**](https://github.com/JstnMcBrd)
- [**AverageHelper**](https://github.com/AverageHelper)
- [**SpencerHastings**](https://github.com/SpencerHastings/)

## Table of contents

- [CSBot](#csbot)
  - [Authors & Contributors](#authors--contributors)
  - [Table of contents](#table-of-contents)
  - [Usage or Development](#usage-or-development)
    - [Prerequisites](#prerequisites)
    - [Clone the Repo](#clone-the-repo)
    - [Get your own bot token](#get-your-own-bot-token)
    - [Configure the bot](#configure-the-bot)
    - [Invite your bot to your server](#invite-your-bot-to-your-server)
    - [Important Note for Windows Users](#important-note-for-windows-users)
    - [Build the bot](#build-the-bot)
    - [Register Slash Commands](#register-slash-commands)
    - [Run the bot](#run-the-bot)
  - [Commands](#commands)
  - [Contributing](#contributing)
  - [License](#license)

## Usage or Development

### Docker

You can skip many of the setup steps by running the project in Docker. This is HIGHLY recommended.
Docker runs the project in a lightweight virtual Linux environment, so functionality will be identical
on any operating system. The project will probably still work on your chosen operating system,
but certain features may break, and we cannot guarantee compatibility.

All of the Docker management (like building, running, and cleaning up images and containers) has been automated,
so you only have to follow a few simple steps.

Install [Docker](https://www.docker.com/) on your computer before continuing.

### Prerequisites

This project requires [NodeJS](https://nodejs.org/) (version 16.10 or later), [NPM](https://npmjs.org/). To make sure you have them available on your machine,
try running the following command:

```sh
$ npm -v && node -v
7.20.3
v16.15.1
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
```

**Do not commit this file to git** or your bot _will_ get "hacked".

### Invite your bot to your server

Go to https://discordapi.com/permissions.html#378091424832 and paste in your bot's client ID to get an invite link.

### Important Note for Windows Users

(You may skip this step if you are using Docker)

If you're on Windows, `npm` scripts will not work unless you tell `npm` to use Git Bash as its default shell when running commands.

Before continuing, run this command:

```sh
$ npm config set script-shell "C:\\Program Files\\Git\\bin\\bash.exe"
```

You must have [Git for Windows](https://git-scm.com/download/win) installed. See this [StackOverflow answer](https://stackoverflow.com/a/46006249) for more details.

### Setting up Docker

If you have chosen to use Docker, run this command before continuing:

```sh
$ npm run docker
```

This will build a simple Linux image, start a container of that image, and then mount
the project folder into the container.

Once the container is started, you will see your command prompt change. You are now
in a virtual Linux environment. If you run `ls`, you will see all the project files.
Any changes you make to these files are synced between your local computer and the container.

Now that your command line is in the Docker container, you can run any part of the project
without worrying about compatibility. From this point on, all setup steps are identical for
inside or outside the container.

To exit the container, simply run `exit`. To re-enter the container, use `npm run docker` again.
Every start you open the project, you should start the container again before developing.

### Build the bot

Be sure to install dependencies, run a quick lint to generate needed files, compile the source, and deploy commands. Here's a handy command to do all of that:

```sh
$ npm run setup
```

### Register Slash Commands

If you want support for Discord [Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ), you'll need to deploy the commands directly. To avoid rate limits, use a command-line tool, rather than deploying on startup.

Once you have your bot's account token in the .env file, run the following command to tell Discord about our commands:

```sh
$ npm run commands:deploy
```

### Run the bot

Since this bot is just a Node script, any Node process manager will do.

```sh
$ node .
# or
$ npm start
# or
$ pm2 start .
```

## Chat Input Commands

### /help

Prints some info about the bot, including the current running version and a link to the code repository.

### /profile

Retrieves the profile picture of the given user.

### /xkcd

Retrieves the most recent [XKCD](https://xkcd.com/) comic, or the given one.

## Context Menu Commands

### Fix Twitter Links

Transforms [twitter.com](https://twitter.com/) links in the given message to [vxtwitter.com](https://vxtwitter.com/) links in an ephemeral reply. Please use vxtwitter in your own messages, especially when the tweet is a video. Twitter's default embed stinks on some platforms.

## Contributing

This project is entirely open-source. Do with it what you will. If you're willing to help me improve this project, consider [filing an issue](https://github.com/BYU-CS-Discord/CSBot/issues/new/choose).

See [CONTRIBUTING.md](/CONTRIBUTING.md) for ways to contribute.

## License

This project's source is licensed under the [Unlicense](LICENSE) license. All contributions thereto are given to the public domain.
