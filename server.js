const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
	res.send("proxy alive");
});

app.get("/rap/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;

		const url = `https://www.pekora.zip/apisite/inventory/v1/users/${userId}/assets/collectibles`;

		const response = await axios.get(url);

		const items = response.data.data || [];
		let total = 0;

		for (const item of items) {
			total += Number(item.recentAveragePrice || 0);
		}

		res.json({
			success: true,
			rap: total
		});

	} catch (err) {
		res.json({
			success: false,
			error: err.message
		});
	}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log("server started");
});
