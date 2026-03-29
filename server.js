const express = require("express");
const axios = require("axios");

const app = express();

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

		const url = `https://www.pekora.zip/users/${userId}/profile`;

		const response = await axios.get(url, {
			timeout: 15000,
			headers: {
				"User-Agent": "Mozilla/5.0",
				"Accept": "text/html"
			}
		});

		const html = String(response.data || "");

		// ИЩЕМ Total RAP
		let match = html.match(/Total RAP:\s*([\d,]+)/i);

		// запасной вариант (если структура другая)
		if (!match) {
			match = html.match(/RAP[^0-9]*([\d,]+)/i);
		}

		if (!match) {
			return res.json({
				success: false,
				error: "RAP not found"
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
			error: err.response?.status
				? `Request failed with status code ${err.response.status}`
				: err.message
		});
	}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log("server started on port " + PORT);
});
