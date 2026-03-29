const express = require("express");
const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

const app = express();

function createAxiosClient() {
	const proxyHost = process.env.PROXY_HOST;
	const proxyPort = process.env.PROXY_PORT;
	const proxyUser = process.env.PROXY_USER;
	const proxyPass = process.env.PROXY_PASS;

	const config = {
		timeout: 20000,
		maxRedirects: 5,
		validateStatus: () => true,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
			"Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
			"Cache-Control": "no-cache",
			"Pragma": "no-cache",
			"Upgrade-Insecure-Requests": "1",
			"Referer": "https://www.pekora.zip/",
			"Origin": "https://www.pekora.zip"
		}
	};

	if (proxyHost && proxyPort) {
		let proxyUrl = `http://${proxyHost}:${proxyPort}`;

		if (proxyUser && proxyPass) {
			proxyUrl = `http://${encodeURIComponent(proxyUser)}:${encodeURIComponent(proxyPass)}@${proxyHost}:${proxyPort}`;
		}

		const agent = new HttpsProxyAgent(proxyUrl);
		config.httpAgent = agent;
		config.httpsAgent = agent;
		config.proxy = false;
	}

	return axios.create(config);
}

const client = createAxiosClient();

app.get("/", (req, res) => {
	res.send("proxy alive");
});

app.get("/rap/:userId", async (req, res) => {
	try {
		const userId = String(req.params.userId || "").trim();

		if (!/^\d+$/.test(userId)) {
			return res.status(400).json({
				success: false,
				error: "Invalid userId"
			});
		}

		const url = `https://www.pekora.zip/internal/collectibles?userId=${userId}`;

		const headers = {};
		if (process.env.PEKORA_COOKIE) {
			headers.Cookie = process.env.PEKORA_COOKIE;
		}

		const response = await client.get(url, { headers });

		if (response.status !== 200) {
			return res.status(500).json({
				success: false,
				error: `Upstream returned ${response.status}`,
				bodyPreview: String(response.data || "").slice(0, 300)
			});
		}

		const html = String(response.data || "");

		const match =
			html.match(/Total RAP:\s*([\d,]+)/i) ||
			html.match(/<p[^>]*class="fw-bolder"[^>]*>\s*Total RAP:\s*([\d,]+)\s*<\/p>/i);

		if (!match) {
			return res.status(404).json({
				success: false,
				error: "Total RAP not found",
				bodyPreview: html.slice(0, 500)
			});
		}

		const rap = parseInt(match[1].replace(/,/g, ""), 10);

		return res.json({
			success: true,
			userId: Number(userId),
			rap
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			error: err.message
		});
	}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log("server started on port " + PORT);
});
