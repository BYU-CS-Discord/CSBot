// TODO testing
// TODO context menu command to speak
// TODO more careful interactionCreate error reporting

// External dependencies
import { existsSync, mkdirSync, writeFileSync, unlinkSync, createReadStream } from 'node:fs';
import { join } from 'node:path';
import {
	SlashCommandBuilder,
	AttachmentPayload,
	ChannelType,
	PermissionFlagsBits,
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
} from '@discordjs/voice';

// Internal depedencies
import { say } from '../dectalk'; // temporary until dectalk is updated with windows support
import * as logger from '../logger';

const builder = new SlashCommandBuilder()
	.setName('talk')
	.setDescription('Uses Dectalk to speak the given message')
	.addStringOption(option =>
		option.setRequired(true).setName('message').setDescription('The message to speak')
	);

// A temporary directory to hold .wav files
const tempDirectory = join(__dirname, 'talk-temp');

export const talk: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ options, channel, client, createdTimestamp, prepareForLongRunningTasks, reply }) {
		// uses the createdTimestamp as a unique file name to avoid conflict
		const tempFileName = `${createdTimestamp}.wav`;

		// this shouldn't happen, but it's good to have error checking anyway
		if (options.length === 0) {
			throw new Error('No options provided');
		}

		const param = options[0];

		// if no message was provided
		if (!param || param?.value === undefined) {
			throw new Error('No message provided');
		}

		const message = param.value as string;

		// this also shouldn't happen, but better safe than sorry
		if (!channel) {
			throw new Error('No channel');
		}

		// generating the audio can take a while, so make sure Discord doesn't think we died
		await prepareForLongRunningTasks(false);

		// generate the audio and store it in a generic buffer
		log('generating audio');
		const wavData: Buffer = await say(message);

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
				throw new Error('Already talking in channel - please try again later');
			}

			// make sure the temporary file directory exists - could be deleted anytime
			if (!existsSync(tempDirectory)) mkdirSync(tempDirectory);

			// store the audio buffer in a temporary .wav file to pass to discordjs/voice
			const tempFilePath = join(tempDirectory, tempFileName);
			writeFileSync(tempFilePath, wavData);
			const stream = createReadStream(tempFilePath);
			const resource = createAudioResource(stream);

			// Plays audio in voice channels
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

				log('deleting temporary .wav file');
				stream.close();
				unlinkSync(tempFilePath);
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
				unlinkSync(tempFilePath);
				throw new Error('Could not connect to voice channel');
			}
		} else {
			// if the command was given in a text channel, send it as an attachment
			log('sending attachment audio');

			const attachment: AttachmentPayload = {
				name: tempFileName,
				attachment: wavData,
			};

			await reply({
				content: message,
				files: [attachment],
			});
		}
	},
};

/**
 * Simple method for consistently-formatted debug output
 * @param message The message to log
 */
function log(message: string): void {
	logger.info(`\t/${builder.name}: ${message}`);
}
