// External dependencies
import { writeFileSync, createReadStream } from 'node:fs';
import isNumber from 'lodash/isNumber';
import {
	SlashCommandBuilder,
	AttachmentPayload,
	ChannelType,
	PermissionFlagsBits,
	CommandInteractionOptionResolver,
} from 'discord.js';
import {
	createAudioResource,
	createAudioPlayer,
	joinVoiceChannel,
	getVoiceConnection,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	NoSubscriberBehavior,
	entersState,
	AudioResource,
} from '@discordjs/voice';
import { say, Speaker } from 'dectalk';
import { fileSync } from 'tmp';

// Internal depedencies
import * as logger from '../logger';

const builder = new SlashCommandBuilder()
	.setName('talk')
	.setDescription('Uses Dectalk to speak the given message')
	.addStringOption(option =>
		option.setRequired(true).setName('message').setDescription('The message to speak')
	)
	.addIntegerOption(option => {
		option.setRequired(false).setName('speaker').setDescription('Whose voice to use');

		Object.values(Speaker)
			.filter(isNumber)
			.forEach(value => {
				const name = Speaker[value];
				if (name === undefined) return;
				option = option.addChoices({ name, value });
			});

		return option;
	});

export const talk: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute(context) {
		const options = context.interaction.options as CommandInteractionOptionResolver;

		// this shouldn't happen, but it's good to have error checking anyway
		if (options.data.length === 0) {
			throw new Error('No options provided');
		}

		const message = options.getString('message', true);
		const speakerNum = options.getInteger('speaker') ?? undefined;

		await speak(message, speakerNum, context);
	},
};

/**
 * This method abstracts-out the functionality of the "talk" command, allowing it to be used
 * by either slash commands or context commands
 * @param message The message to speak
 * @param speakerNum Which speaker to use (can be undefined)
 * @param context The context of the interaction (either TextInputCommandContext or MessageContextCommandContext)
 */
export async function speak(
	message: string,
	speakerNum: Speaker | undefined,
	{ channel, client, prepareForLongRunningTasks, reply }: BaseCommandContext
): Promise<void> {
	// this also shouldn't happen, but better safe than sorry
	if (!channel) {
		throw new Error('No channel');
	}

	// this could happen if the user uses the context menu command on an empty message
	if (!message || message === '') {
		throw new Error('Message cannot be empty');
	}

	// generating the audio can take a while, so make sure Discord doesn't think we died
	await prepareForLongRunningTasks(false);

	// generate the audio and store it in a generic buffer
	log('generating audio');
	const wavData: Buffer = await say(message, {
		Speaker: speakerNum,
	});

	// if the command was given in a voice chat, speak it
	if (channel.type === ChannelType.GuildVoice) {
		// make sure we have the right permissions to talk
		const permissions = channel.permissionsFor(client.user);
		if (!permissions) {
			throw new Error('Could not fetch permissions for channel');
		}
		if (!permissions.has(PermissionFlagsBits.Connect)) {
			throw new Error('Missing required permissions to connect to voice channel');
		}
		if (!permissions.has(PermissionFlagsBits.Speak)) {
			throw new Error('Missing required permissions to speak in voice channel');
		}

		// check to see if we're already connected to this channel
		// a channel can only have one connection & one player at a time!
		if (getVoiceConnection(channel.guild.id)) {
			throw new Error('Already talking in channel\n\nPlease try again later');
		}

		// store the audio buffer in a temporary .wav file to pass to discordjs/voice
		const tempFile = fileSync({ prefix: 'dectalk', postfix: '.wav' });
		writeFileSync(tempFile.name, wavData);
		const stream = createReadStream(tempFile.name);

		// create an audio resource from the temporary file
		let resource: AudioResource;
		try {
			resource = createAudioResource(stream);
		} catch (error) {
			// if it's not an error, leave it alone
			if (!(error instanceof Error)) throw error;

			// for this error, provide a more useful message
			if (error.message === 'FFmpeg/avconv not found!') {
				throw new Error(
					"'ffmpeg-static' missing proper encoder for current OS\n\n" +
						'Please run a clean install of all dependencies'
				);
			}

			// remember to close file stream
			stream.close();

			// don't tamper with any other errors
			throw error;
		}

		// create a player to stream the resource
		const player = createAudioPlayer({
			behaviors: {
				// play even when there's no one in the channel
				noSubscriber: NoSubscriberBehavior.Play,
			},
		});

		// create a new audio connection to the voice channel the command was given in
		log('joining channel');
		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfMute: false,
		});

		// when the connection is ready, attach the player and give the player the audio
		connection.once(VoiceConnectionStatus.Ready, () => {
			log('connection ready');
			connection.subscribe(player);
			player.play(resource);
		});

		// when the player finishes playing the audio, disconnect if connected, and delete the audio file
		player.on(AudioPlayerStatus.Idle, () => {
			log('player done');

			if (
				connection.state.status !== VoiceConnectionStatus.Disconnected &&
				connection.state.status !== VoiceConnectionStatus.Destroyed
			) {
				connection.disconnect();
			}

			// remember to close file stream
			stream.close();
		});

		// when the connection closes, stop the player if playing and end the interaction
		connection.on(VoiceConnectionStatus.Disconnected, () => {
			log('disconnected');
			connection.destroy();

			log('replying to interaction');
			void reply({
				content: message,
			});

			player.stop();
		});

		// if the connection doesn't succeed within 10 seconds, clean up and throw an error to end the interaction
		try {
			await entersState(connection, VoiceConnectionStatus.Ready, 10e3);
		} catch {
			player.stop();
			connection.destroy();
			stream.close();
			throw new Error('Could not connect to voice channel');
		}
	} else {
		// if the command was given in a text channel, send it as an attachment
		log('sending attachment audio');

		const attachment: AttachmentPayload = {
			name: `${message}.wav`,
			attachment: wavData,
		};

		await reply({
			content: message,
			files: [attachment],
		});
	}
}

/**
 * Simple method for consistently-formatted debug output
 * @param message The message to log
 */
function log(message: string): void {
	logger.info(`\t/${builder.name}: ${message}`);
}
