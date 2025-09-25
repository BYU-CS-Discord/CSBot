// Note: This file should never be imported or rolled into a bundle.
// The path to this file is passed into `node:worker_threads`.

let UPTIME_URL: URL;
try {
	UPTIME_URL = new URL(process.env['UPTIME_URL'] ?? "");
} catch (error) {
	console.error("[uptime] UPTIME_URL is invalid:", error);
	process.exit(1); // exit the worker thread
}

// If interval is missing or invalid, use 300s
let UPTIME_INTERVAL_SECONDS = Number(process.env['UPTIME_INTERVAL_SECONDS'] ?? "300");
if (Number.isNaN(UPTIME_INTERVAL_SECONDS) || UPTIME_INTERVAL_SECONDS <= 15) {
	UPTIME_INTERVAL_SECONDS = 300;
}
const delayMs = UPTIME_INTERVAL_SECONDS * 1_000;

console.info(`[uptime] Ready to ping every ${UPTIME_INTERVAL_SECONDS}s at endpoint: ${UPTIME_URL}`);

setInterval(async (url: URL) => {
	try {
		await fetch(url);
		console.info("[uptime] Ping!");
	} catch (error) {
		console.error("[uptime] Failed to ping:", error)
	}
}, delayMs, UPTIME_URL);
