import type { Mock } from 'vitest';
import { fetchJson } from '../helpers/fetch';
import { HttpStatusCode } from '../helpers/HttpStatusCode';
import { NetworkError } from '../helpers/NetworkError';

vi.mock('../helpers/fetch', () => ({ fetchJson: vi.fn() }));

const mockedFetchJson = fetchJson as Mock<
	Parameters<typeof fetchJson>,
	ReturnType<typeof fetchJson>
>;

// Mock the logger so nothing is printed
vi.mock('../logger');

const latestGood = {
	month: '9',
	num: 2679,
	link: '',
	year: '2022',
	news: '',
	safe_title: 'Quantified Self',
	transcript: '',
	alt: "It's made me way more excited about ferris wheels, subways, car washes, waterslides, and store entrances that have double doors with a divider in the middle.",
	img: 'https://imgs.xkcd.com/comics/quantified_self.png',
	title: 'Quantified Self',
	day: '30',
};

const chosen = {
	month: '1',
	num: 35,
	link: '',
	news: '',
	safe_title: 'Sheep',
	transcript:
		"Heading: Another from my high-school notebooks.\n[[A sheep and a potted saguaro cactus linked by an arcing yellow electricity bolt, drawn on graph paper]]\n{{title text: I think it's the sheep zapping the cactus and not vice-versa}}",
	alt: "I think it's the sheep zapping the cactus and not vice-versa",
	year: '2006',
	title: 'Sheep',
	day: '1',
	img: 'https://imgs.xkcd.com/comics/sheep.jpg',
};

const badResponse = new NetworkError(HttpStatusCode.BAD_REQUEST);

// Import the code to test
import { xkcd } from './xkcd';

describe('xkcd', () => {
	const mockReply = vi.fn();
	const mockSendTyping = vi.fn();
	const mockGetInteger = vi.fn();
	let context: TextInputCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			sendTyping: mockSendTyping,
			options: {
				getInteger: mockGetInteger,
			},
		} as unknown as TextInputCommandContext;
		mockGetInteger.mockReturnValue(null);
	});

	test('Throws an error when the number is out of bounds', async () => {
		mockedFetchJson.mockResolvedValue(latestGood);

		// they just need the number from the initial call
		mockGetInteger.mockReturnValueOnce(-1);
		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledOnce();

		mockGetInteger.mockReturnValueOnce(0);

		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledTimes(2);
	});

	test('Returning an embed with the latest comic when no number is given', async () => {
		mockedFetchJson.mockResolvedValue(latestGood);
		mockGetInteger.mockReturnValueOnce(null);
		await expect(xkcd.execute(context)).resolves.toBeUndefined();
		expect(mockSendTyping).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledExactlyOnceWith({
			embeds: [expect.toBeObject()],
			ephemeral: false,
		});
	});

	test('Returning an embed with a comic given by a number parameter', async () => {
		mockedFetchJson.mockResolvedValue(chosen);
		mockedFetchJson.mockResolvedValueOnce(latestGood);
		mockGetInteger.mockReturnValueOnce(chosen.num);
		await expect(xkcd.execute(context)).resolves.toBeUndefined();
		expect(mockSendTyping).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledExactlyOnceWith({
			embeds: [expect.toBeObject()],
			ephemeral: false,
		});
	});

	test('Checking when a second call to the API fails', async () => {
		mockedFetchJson.mockRejectedValue(badResponse);
		mockedFetchJson.mockResolvedValueOnce(latestGood);
		mockGetInteger.mockReturnValueOnce(chosen.num);
		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});

	test('Checking when a first call to the API fails', async () => {
		mockedFetchJson.mockRejectedValue(badResponse);
		mockGetInteger.mockReturnValueOnce(chosen.num);
		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});
});
