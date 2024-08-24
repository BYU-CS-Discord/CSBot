import type { AttachmentPayload } from 'discord.js';
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import type { AudioResource } from '@discordjs/voice';
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
// eslint-disable-next-line import/default, import/namespace, import/no-named-as-default, import/no-named-as-default-member
import dectalk from 'dectalk-tts';
import { writeFileSync, createReadStream } from 'node:fs';
import { fileSync } from 'tmp';

import { info } from '../logger.js';

export enum Speaker {
	Paul = 'PAUL',
	Betty = 'BETTY',
	Harry = 'HARRY',
	Frank = 'FRANK',
	Dennis = 'DENNIS',
	Kit = 'KIT',
	Ursula = 'URSULA',
	Rita = 'RITA',
	Wendy = 'WENDY',
}

const builder = new SlashCommandBuilder()
	.setName('talk')
	.setDescription('Uses Dectalk to speak the given message (via https://tts.cyzon.us/)')
	.addStringOption(option =>
		option.setRequired(true).setName('message').setDescription('The message to speak')
	)
	.addStringOption(option => {
		option.setRequired(false).setName('speaker').setDescription('Whose voice to use');
		Object.keys(Speaker).forEach(name => {
			const value = (Speaker as Record<string, string>)[name];
			if (value === undefined) return;
			option = option.addChoices({ name, value });
		});
		return option;
	});

export const talk: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute(context) {
		const options = context.options;
		const message = options.getString('message', true);
		const speaker = (options.getString('speaker', false) as Speaker | null) ?? undefined;

		await speak(context, message, speaker);
	},
};

/**
 * This method abstracts-out the functionality of the "talk" command, allowing it to be used
 * by either slash commands or context commands
 * @param context The context of the interaction (either TextInputCommandContext or MessageContextCommandContext)
 * @param message The message to speak
 * @param speaker Which speaker to use
 */
export async function speak(
	{ channel, client, prepareForLongRunningTasks, reply }: BaseCommandContext,
	message: string,
	speaker?: Speaker
): Promise<void> {
	// This shouldn't happen, but better safe than sorry
	if (!channel) {
		throw new Error('No channel');
	}

	// This could happen if the user uses the context menu command on an empty message
	if (!message || message.trim() === '') {
		throw new Error('Message cannot be empty');
	}

	// Generating the audio can take a while, so make sure Discord doesn't think we died
	await prepareForLongRunningTasks(false);

	// If the speaker is defined, prepend the message with the speaker's name
	if (speaker) {
		message = `[:name ${speaker}] ` + message;
	}

	// Generate the audio and store it in a generic buffer
	log('generating audio');
	const wavData = await dectalk(message);

	// If the command was given in a voice chat, speak it
	if (channel.type === ChannelType.GuildVoice) {
		// Make sure we have the right permissions to talk
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

		// Check to see if we're already connected to this channel
		// A channel can only have one connection & one player at a time!
		if (getVoiceConnection(channel.guild.id)) {
			throw new Error('Already talking in channel\n\nPlease try again later');
		}

		// Store the audio buffer in a temporary .wav file to pass to discordjs/voice
		const tempFile = fileSync({ prefix: 'dectalk', postfix: '.wav' });
		writeFileSync(tempFile.name, wavData);
		const stream = createReadStream(tempFile.name);

		// Create an audio resource from the temporary file
		let resource: AudioResource;
		try {
			resource = createAudioResource(stream);
		} catch (error) {
			// If it's not an error, leave it alone
			if (!(error instanceof Error)) throw error;

			// For this error, provide a more useful message
			if (error.message === 'FFmpeg/avconv not found!') {
				throw new Error(
					"'ffmpeg-static' missing proper encoder for current OS\n\n" +
						'Please run a clean install of all dependencies'
				);
			}

			// Remember to close file stream
			stream.close();

			// Don't tamper with any other errors
			throw error;
		}

		// Create a player to stream the resource
		const player = createAudioPlayer({
			behaviors: {
				// Play even when there's no one in the channel
				noSubscriber: NoSubscriberBehavior.Play,
			},
		});

		// Create a new audio connection to the voice channel the command was given in
		log('joining channel');
		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfMute: false,
		});

		// When the connection is ready, attach the player and give the player the audio
		connection.once(VoiceConnectionStatus.Ready, () => {
			log('connection ready');
			connection.subscribe(player);
			player.play(resource);
		});

		// When the player finishes playing the audio, disconnect if connected, and delete the audio file
		player.on(AudioPlayerStatus.Idle, () => {
			log('player done');

			if (
				connection.state.status !== VoiceConnectionStatus.Disconnected &&
				connection.state.status !== VoiceConnectionStatus.Destroyed
			) {
				connection.disconnect();
			}

			// Remember to close file stream
			stream.close();
		});

		// When the connection closes, stop the player if playing and end the interaction
		connection.on(VoiceConnectionStatus.Disconnected, () => {
			log('disconnected');
			connection.destroy();

			log('replying to interaction');
			void reply({
				content: message,
			});

			player.stop();
		});

		// If the connection doesn't succeed within 10 seconds, clean up and throw an error to end the interaction
		try {
			await entersState(connection, VoiceConnectionStatus.Ready, 10e3);
		} catch {
			player.stop();
			connection.destroy();
			stream.close();
			throw new Error('Could not connect to voice channel');
		}
	} else {
		// If the command was given in a text channel, send it as an attachment
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
	info(`\t/${builder.name}: ${message}`);
}
