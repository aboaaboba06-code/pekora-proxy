app.get("/rap/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;

		const url = `https://www.pekora.zip/internal/collectibles?userId=${userId}`;

		const response = await axios.get(url, {
			headers: {
				"User-Agent": "Mozilla/5.0"
			}
		});

		const html = response.data;

		const match = html.match(/Total RAP:\s*(\d+)/);

		if (match) {
			return res.json({
				success: true,
				rap: parseInt(match[1])
			});
		}

		return res.json({
			success: false,
			error: "RAP not found"
		});

	} catch (err) {
		return res.status(500).json({
			success: false,
			error: err.message
		});
	}
});
