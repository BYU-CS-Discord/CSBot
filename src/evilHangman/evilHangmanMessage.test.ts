import type { EmbedBuilder } from '@discordjs/builders';
import { EvilHangmanWinState } from './evilHangmanGame';
import { buildEvilHangmanMessage } from './evilHangmanMessage';

describe('evilHangmanMessage', () => {
	describe('buildEvilHangmanMessage', () => {
		test('in progress game has embed and buttons but no description', async () => {
			const message = await buildEvilHangmanMessage({
				word: '',
				guessesRemaining: 1,
				guessesSoFar: new Set(),
				winState: EvilHangmanWinState.IN_PROGRESS,
			});
			expect(message.embeds).toBeArray();
			const embed = message.embeds?.[0] as EmbedBuilder;
			expect(embed).toBeObject();
			expect(embed?.data?.description).toBeUndefined();
			expect(message.components).toBeArrayOfSize(5);
		});

		test('win and lost states have descriptions and no buttons', async () => {
			const winMessage = await buildEvilHangmanMessage({
				word: '',
				guessesRemaining: 1,
				guessesSoFar: new Set(),
				winState: EvilHangmanWinState.WON,
			});
			const winEmbed = winMessage.embeds?.[0] as EmbedBuilder;
			expect(winEmbed.data.description).not.toBeUndefined();
			expect(winMessage.components).toBeEmpty();

			const lostMessage = await buildEvilHangmanMessage({
				word: '',
				guessesRemaining: 0,
				guessesSoFar: new Set(),
				winState: EvilHangmanWinState.LOST,
				correctWord: '',
			});
			const lostEmbed = lostMessage.embeds?.[0] as EmbedBuilder;
			expect(lostEmbed.data.description).not.toBeUndefined();
			expect(lostMessage.components).toBeEmpty();
		});

		test('second page has only one row of buttons', async () => {
			const message = await buildEvilHangmanMessage(
				{
					word: '',
					guessesRemaining: 1,
					guessesSoFar: new Set(),
					winState: EvilHangmanWinState.IN_PROGRESS,
				},
				1
			);
			expect(message.components).toBeArrayOfSize(1);
		});
	});
});
