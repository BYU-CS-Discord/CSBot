import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import {
	createTag,
	getTag,
	getAllTags,
	incrementTagUseCount,
	deleteTag,
	searchTags,
} from '../helpers/tagUtils.js';
import { UserMessageError } from '../helpers/UserMessageError.js';
import { isAdmin } from '../helpers/smiteUtils.js';

const NameOption = 'name';
const ContentOption = 'content';

const AddSubcommand = 'add';
const SendSubcommand = 'send';
const PreviewSubcommand = 'preview';
const ListSubcommand = 'list';
const RemoveSubcommand = 'remove';

const builder = new SlashCommandBuilder()
	.setName('tag')
	.setDescription('Manage and use tagged images/links')
	.addSubcommand(subcommand =>
		subcommand
			.setName(AddSubcommand)
			.setDescription('Create a new tag')
			.addStringOption(option =>
				option
					.setName(NameOption)
					.setDescription('The name of the tag')
					.setRequired(true)
					.setMaxLength(100)
			)
			.addStringOption(option =>
				option
					.setName(ContentOption)
					.setDescription('The URL or text content for the tag')
					.setRequired(true)
					.setMaxLength(2000)
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
				const content = options.getString(ContentOption, true);

				try {
					await createTag(guild.id, name, content, user.id);

					// Check if content is an image URL
					const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?.*)?$/i;
					const isImage = imageUrlRegex.test(content);

					const embed = new EmbedBuilder()
						.setTitle('✅ Tag Created')
						.setDescription(`Tag \`${name}\` has been created!`)
						.setColor(0x00_ff_00) // Green
						.setFooter({ text: `Created by ${user.username}` });

					// If it's an image, display it; otherwise show as text field
					if (isImage) {
						embed.setImage(content);
					} else {
						embed.addFields({ name: 'Content', value: content });
					}

					await reply({
						embeds: [embed],
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

				// Check if content is an image URL
				const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?.*)?$/i;
				if (imageUrlRegex.test(tagData.content)) {
					// Send as embed with image
					await reply({
						embeds: [
							new EmbedBuilder().setImage(tagData.content).setColor(0x58_65_f2), // Blurple
						],
					});
				} else {
					// Send as plain text (for non-image URLs or text)
					await reply({ content: tagData.content });
				}
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

				// Check if content is an image URL
				const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?.*)?$/i;
				const isImage = imageUrlRegex.test(tagData.content);

				const embed = new EmbedBuilder()
					.setTitle(`Preview: ${name}`)
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
						}
					)
					.setColor(0x58_65_f2); // Blurple

				// If it's an image, display it; otherwise show as text
				if (isImage) {
					embed.setImage(tagData.content);
				} else {
					embed.setDescription(tagData.content);
				}

				await reply({
					embeds: [embed],
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
								.setTitle('📋 Tags')
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
						.setTitle(i === 0 ? `📋 Tags (${tags.length} total)` : 'Tags (continued)')
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
								.setTitle('🗑️ Tag Removed')
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
