import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import {
	createTag,
	getTag,
	getAllTags,
	incrementTagUseCount,
	deleteTag,
	searchTags,
	validateImageAttachment,
	downloadAttachment,
} from '../helpers/tagUtils.js';
import { UserMessageError } from '../helpers/UserMessageError.js';
import { isAdmin } from '../helpers/smiteUtils.js';

const NameOption = 'name';
const ImageOption = 'image';

const AddSubcommand = 'add';
const SendSubcommand = 'send';
const PreviewSubcommand = 'preview';
const ListSubcommand = 'list';
const RemoveSubcommand = 'remove';

const builder = new SlashCommandBuilder()
	.setName('tag')
	.setDescription('Manage and use tagged images')
	.addSubcommand(subcommand =>
		subcommand
			.setName(AddSubcommand)
			.setDescription('Create a new tag from an image')
			.addStringOption(option =>
				option
					.setName(NameOption)
					.setDescription('The name of the tag')
					.setRequired(true)
					.setMaxLength(100)
			)
			.addAttachmentOption(option =>
				option
					.setName(ImageOption)
					.setDescription('The image to store (PNG, JPEG, GIF, WebP, max 10 MB)')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName(SendSubcommand)
			.setDescription('Post a tag publicly')
			.addStringOption(option =>
				option
					.setName(NameOption)
					.setDescription('The name of the tag to send')
					.setRequired(true)
					.setAutocomplete(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName(PreviewSubcommand)
			.setDescription('Preview a tag privately (ephemeral)')
			.addStringOption(option =>
				option
					.setName(NameOption)
					.setDescription('The name of the tag to preview')
					.setRequired(true)
					.setAutocomplete(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand.setName(ListSubcommand).setDescription('List all available tags in this server')
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName(RemoveSubcommand)
			.setDescription('Remove a tag you created')
			.addStringOption(option =>
				option
					.setName(NameOption)
					.setDescription('The name of the tag to remove')
					.setRequired(true)
					.setAutocomplete(true)
			)
	);

export const tag: GuildedCommand = {
	info: builder,
	requiresGuild: true,
	async autocomplete(interaction) {
		const guildId = interaction.guildId;
		if (!guildId) return [];

		const focusedValue = interaction.options.getFocused();
		const tags = await searchTags(guildId, focusedValue);

		return tags.map(name => ({ name, value: name }));
	},
	async execute({ reply, options, guild, user, member }): Promise<void> {
		const subcommand = options.getSubcommand();

		switch (subcommand) {
			case AddSubcommand: {
				const name = options.getString(NameOption, true);
				const attachment = options.getAttachment(ImageOption, true);

				try {
					validateImageAttachment(attachment.contentType, attachment.size);
					const imageData = await downloadAttachment(attachment.url);
					await createTag(
						guild.id,
						name,
						imageData,
						attachment.name,
						attachment.contentType!,
						user.id
					);

					const file = new AttachmentBuilder(imageData, { name: attachment.name });
					const embed = new EmbedBuilder()
						.setTitle('Tag Created')
						.setDescription(`Tag \`${name}\` has been created!`)
						.setImage(`attachment://${attachment.name}`)
						.setColor(0x00_ff_00) // Green
						.setFooter({ text: `Created by ${user.username}` });

					await reply({
						embeds: [embed],
						files: [file],
						ephemeral: true,
					});
				} catch (error) {
					if (error instanceof Error) {
						throw new UserMessageError(error.message);
					}
					throw error;
				}
				break;
			}

			case SendSubcommand: {
				const name = options.getString(NameOption, true);
				const tagData = await getTag(guild.id, name);

				if (!tagData) {
					throw new UserMessageError(
						`Tag \`${name}\` not found. Use \`/tag list\` to see available tags.`
					);
				}

				// Increment use count
				await incrementTagUseCount(guild.id, name);

				const file = new AttachmentBuilder(Buffer.from(tagData.imageData), {
					name: tagData.fileName,
				});

				await reply({ files: [file] });
				break;
			}

			case PreviewSubcommand: {
				const name = options.getString(NameOption, true);
				const tagData = await getTag(guild.id, name);

				if (!tagData) {
					throw new UserMessageError(
						`Tag \`${name}\` not found. Use \`/tag list\` to see available tags.`
					);
				}

				const file = new AttachmentBuilder(Buffer.from(tagData.imageData), {
					name: tagData.fileName,
				});

				const embed = new EmbedBuilder()
					.setTitle(`Preview: ${name}`)
					.setImage(`attachment://${tagData.fileName}`)
					.addFields(
						{
							name: 'Created By',
							value: `<@${tagData.createdBy}>`,
							inline: true,
						},
						{
							name: 'Uses',
							value: tagData.useCount.toString(),
							inline: true,
						},
						{
							name: 'Created',
							value: tagData.createdAt.toLocaleDateString(),
							inline: true,
						},
						{
							name: 'File',
							value: tagData.fileName,
							inline: true,
						}
					)
					.setColor(0x58_65_f2); // Blurple

				await reply({
					embeds: [embed],
					files: [file],
					ephemeral: true,
				});
				break;
			}

			case ListSubcommand: {
				const tags = await getAllTags(guild.id);

				if (tags.length === 0) {
					await reply({
						embeds: [
							new EmbedBuilder()
								.setTitle('Tags')
								.setDescription('No tags available in this server.\n\nCreate one with `/tag add`!')
								.setColor(0xff_a5_00), // Orange
						],
						ephemeral: true,
					});
					return;
				}

				// Split into multiple embeds if there are too many tags
				const maxFieldsPerEmbed = 25;
				const embeds: Array<EmbedBuilder> = [];

				for (let i = 0; i < tags.length; i += maxFieldsPerEmbed) {
					const chunk = tags.slice(i, i + maxFieldsPerEmbed);
					const embed = new EmbedBuilder()
						.setTitle(i === 0 ? `Tags (${tags.length} total)` : 'Tags (continued)')
						.setColor(0x58_65_f2); // Blurple

					for (const tagData of chunk) {
						embed.addFields({
							name: tagData.name,
							value: `Uses: ${tagData.useCount} | By <@${tagData.createdBy}>`,
							inline: false,
						});
					}

					embeds.push(embed);
				}

				await reply({ embeds, ephemeral: true });
				break;
			}

			case RemoveSubcommand: {
				const name = options.getString(NameOption, true);

				try {
					// Check if user is an admin
					const userIsAdmin = isAdmin(member);
					const deleted = await deleteTag(guild.id, name, user.id, userIsAdmin);

					if (!deleted) {
						throw new UserMessageError(
							`Tag \`${name}\` not found. Use \`/tag list\` to see available tags.`
						);
					}

					await reply({
						embeds: [
							new EmbedBuilder()
								.setTitle('Tag Removed')
								.setDescription(`Tag \`${name}\` has been deleted.`)
								.setColor(0xff_00_00), // Red
						],
						ephemeral: true,
					});
				} catch (error) {
					if (error instanceof Error) {
						throw new UserMessageError(error.message);
					}
					throw error;
				}
				break;
			}

			default: {
				throw new UserMessageError('Unknown subcommand');
			}
		}
	},
};
