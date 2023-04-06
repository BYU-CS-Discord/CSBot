import { db } from '../src/database';
import { readFileSync } from 'fs';

const [_, sourceFilePath, guildId] = process.argv;

interface ZeKaiserScoreEntry {
	userID: string;
	statistic: string;
	value: number;
}
interface CsBotStats {
	userId: string;
	guildId: string;
	name: string;
	score: number;
}

const rawStats = readFileSync(sourceFilePath);
const zeKaiserStats = JSON.parse(rawStats.toString()) as Array<ZeKaiserScoreEntry>;
const csBotStats: Array<CsBotStats> = zeKaiserStats.map(stat => ({
	userId: stat.userID,
	guildId,
	name: stat.statistic,
	score: stat.value,
}));

await db.scoreboard.createMany({
	data: csBotStats,
});
