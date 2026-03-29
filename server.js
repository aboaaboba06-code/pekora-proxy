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

		const cookie = process.env.PEKORA_COOKIE;
		if (!cookie) {
			return res.status(500).json({
				success: false,
				error: "PEKORA_COOKIE is missing"
			});
		}

		const url = `https://www.pekora.zip/apisite/inventory/v1/users/${userId}/assets/collectibles`;

		const response = await axios.get(url, {
			timeout: 15000,
			headers: {
				"User-Agent": "Mozilla/5.0",
				"Accept": "application/json,text/plain,*/*",
				"Cookie": cookie
			}
		});

		const data = response.data;
		const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

		let total = 0;

		for (const item of items) {
			const rap = Number(
				item?.recentAveragePrice ??
				item?.rap ??
				item?.averagePrice ??
				0
			);

			if (!Number.isNaN(rap)) {
				total += rap;
			}
		}

		return res.json({
			success: true,
			rap: total
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
