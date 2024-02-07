import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Attachment } from 'discord.js';
import { Collection } from 'discord.js';

import { altText } from './altText.js';

describe('Get Alt Text', () => {
	const mockReplyPrivately = vi.fn();
	let context: MessageContextMenuCommandContext;
	let mockAttachments: Collection<string, Attachment>;

	beforeEach(() => {
		mockAttachments = new Collection();
		context = {
			targetMessage: {
				content: '',
				attachments: mockAttachments,
			},
			replyPrivately: mockReplyPrivately,
		} as unknown as MessageContextMenuCommandContext;
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('tells the user when there are no images', async () => {
		const response = 'This message contains no attachments.';
		await expect(altText.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockReplyPrivately).toHaveBeenCalledWith(response);
	});

	test('tells the user when there is only one undescribed image', async () => {
		mockAttachments.set('123456', {
			description: null,
		} as unknown as Attachment);

		const response = 'The attachment in this message has no text description.';
		await expect(altText.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockReplyPrivately).toHaveBeenCalledWith(response);
	});

	test('tells the user when none of two attachments contains a description', async () => {
		mockAttachments.set('123456', {
			description: null,
		} as unknown as Attachment);
		mockAttachments.set('789012', {
			description: null,
		} as unknown as Attachment);

		const response = 'None of the 2 attachments in this message contains a text description.';
		await expect(altText.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockReplyPrivately).toHaveBeenCalledWith(response);
	});

	test('tells the user when no attachments contains a description, or some are only whitespace', async () => {
		mockAttachments.set('123456', {
			description: null,
		} as unknown as Attachment);
		mockAttachments.set('789012', {
			description: '',
		} as unknown as Attachment);
		mockAttachments.set('345678', {
			description: '  ',
		} as unknown as Attachment);

		const response = 'None of the 3 attachments in this message contains a text description.';
		await expect(altText.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockReplyPrivately).toHaveBeenCalledWith(response);
	});

	test('replies with the image description', async () => {
		const description = 'An empty, grassy field';
		mockAttachments.set('123456', {
			description,
		} as unknown as Attachment);

		const response = `## Image Description\n> ${description}`;
		await expect(altText.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockReplyPrivately).toHaveBeenCalledWith(response);
	});

	test('replies with the description of each image', async () => {
		const description1 = 'An empty, grassy field';
		const description2 = 'The same field, with a tall, slender figure standing in the middle';
		const description3 = 'The figure is much closer to the camera, now.';
		mockAttachments.set('123456', {
			description: description1,
		} as unknown as Attachment);
		mockAttachments.set('789012', {
			description: description2,
		} as unknown as Attachment);
		mockAttachments.set('345678', {
			description: description3,
		} as unknown as Attachment);

		const response = `## Image Descriptions\n### Image 1\n> ${description1}\n### Image 2\n> ${description2}\n### Image 3\n> ${description3}`;
		await expect(altText.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockReplyPrivately).toHaveBeenCalledWith(response);
	});

	test('replies with the description of each image, noting images without description', async () => {
		const description1 = 'An empty, grassy field';
		const description2 = 'The same field, with a tall, slender figure standing in the middle';
		const description3 = 'The figure is much closer to the camera, now.';
		mockAttachments.set('123456', {
			description: description1,
		} as unknown as Attachment);
		mockAttachments.set('789012', {
			description: description2,
		} as unknown as Attachment);
		mockAttachments.set('345678', {
			description: description3,
		} as unknown as Attachment);
		mockAttachments.set('901234', {
			description: null,
		} as unknown as Attachment);

		const response = `## Image Descriptions\n### Image 1\n> ${description1}\n### Image 2\n> ${description2}\n### Image 3\n> ${description3}\n### Image 4 has no description`;
		await expect(altText.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockReplyPrivately).toHaveBeenCalledWith(response);
	});
});
