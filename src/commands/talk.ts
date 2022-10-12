// External dependencies
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
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
	AudioPlayerStatus,
	VoiceConnectionStatus,
	NoSubscriberBehavior,
	PlayerSubscription,
	entersState,
} from '@discordjs/voice';

// Internal depedencies
import { say } from '../../dectalk'; // temporary until dectalk is updated with windows support
import * as logger from '../logger';

const builder = new SlashCommandBuilder()
	.setName('talk')
	.setDescription('Uses Dectalk to speak the given message')
	.addStringOption(option => option.setName('message').setDescription('The message to speak'));

// Plays audio in voice channels
const player = createAudioPlayer({
	behaviors: {
		// play even when there's no one in the channel
		noSubscriber: NoSubscriberBehavior.Play,
	},
});

// A temporary directory to hold .wav files
const tempDirectory = join(__dirname, 'talk-temp');

export const talk: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({
		options,
		channel,
		interaction,
		createdTimestamp,
		prepareForLongRunningTasks,
		reply,
	}) {
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
			const permissions = channel.permissionsFor(interaction.client.user);
			if (!permissions) {
				throw new Error('Could not fetch permissions for channel');
			}
			if (!permissions.has(PermissionFlagsBits.Connect)) {
				throw new Error('Missing required permissions to connect to voice channel');
			}
			if (!permissions.has(PermissionFlagsBits.Speak)) {
				throw new Error('Missing required permissions to speak in voice channel');
			}

			// make sure the temporary file directory exists - could be deleted anytime
			if (!existsSync(tempDirectory)) {
				mkdirSync(tempDirectory);
			}

			// store the audio buffer in a temporary .wav file to pass to discordjs/voice
			const tempFilePath = join(tempDirectory, tempFileName);
			writeFileSync(tempFilePath, wavData);
			const resource = createAudioResource(tempFilePath);

			// create a new audio connection to the voice channel the command was given in
			log('joining channel');
			const connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: channel.guild.id,
				adapterCreator: channel.guild.voiceAdapterCreator,
				selfMute: false,
			});
			let subscription: PlayerSubscription | undefined;

			// when the connection is ready, attach the player and give the player the audio
			connection.once(VoiceConnectionStatus.Ready, () => {
				log('connection ready');
				subscription = connection.subscribe(player);
				player.play(resource);
			});

			// when the player finishes playing the audio, auto-disconnect
			player.on(AudioPlayerStatus.Idle, () => {
				log('player done');
				player.stop();
				subscription?.unsubscribe();
				connection.disconnect();
			});

			// when the connection ends, clean up memory and end the interaction
			connection.on(VoiceConnectionStatus.Disconnected, () => {
				log('disconnected');
				connection.destroy();

				unlinkSync(tempFilePath);

				void reply({
					content: `:loud_sound: "${message}"`,
				});
			});

			// if the connection doesn't succeed within 10 seconds, clean up and throw an error to end the interaction
			try {
				await entersState(connection, VoiceConnectionStatus.Ready, 10e3);
			} catch {
				player.stop();
				subscription?.unsubscribe();
				connection.disconnect();
				connection.destroy();
				unlinkSync(tempFilePath);
				throw new Error('Could not connected to voice channel');
			}
		} else {
			// if the command was given in a text channel, send it as an attachment
			log('sending attachment audio');

			const attachment: AttachmentPayload = {
				name: tempFileName,
				attachment: wavData,
			};

			await reply({
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
