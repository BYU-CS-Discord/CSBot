import axios from 'axios';
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the logger so nothing is printed
jest.mock('../logger');

const latestGood = {
	status: 200,
	data: {
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
	},
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

const chosenGood = {
	status: 200,
	data: chosen,
};

const badResponse = {
	status: 400,
	data: null,
};

// Import the code to test
import { xkcd } from './xkcd';

describe('xkcd', () => {
	const mockReply = jest.fn();
	const mockSendTyping = jest.fn();
	const mockGetInteger = jest.fn();
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
		mockedAxios.get.mockResolvedValue(latestGood);

		// they just need the number from the initial call
		mockGetInteger.mockReturnValueOnce(-1);
		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledOnce();

		mockGetInteger.mockReturnValueOnce(0);

		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledTimes(2);
	});

	test('Returning an embed with the latest comic when no number is given', async () => {
		mockedAxios.get.mockResolvedValue(latestGood);
		mockGetInteger.mockReturnValueOnce(null);
		await expect(xkcd.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockSendTyping).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			ephemeral: false,
		});
	});

	test('Returning an embed with a comic given by a number parameter', async () => {
		mockedAxios.get.mockResolvedValue(chosenGood);
		mockedAxios.get.mockResolvedValueOnce(latestGood);
		mockGetInteger.mockReturnValueOnce(chosen.num);
		await expect(xkcd.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockSendTyping).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			ephemeral: false,
		});
	});

	test('Checking when a second call to the API fails', async () => {
		mockedAxios.get.mockResolvedValue(badResponse);
		mockedAxios.get.mockResolvedValueOnce(latestGood);
		mockGetInteger.mockReturnValueOnce(chosen.num);
		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});

	test('Checking when a first call to the API fails', async () => {
		mockedAxios.get.mockResolvedValue(badResponse);
		mockGetInteger.mockReturnValueOnce(chosen.num);
		await expect(xkcd.execute(context)).rejects.toThrow();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});
});
