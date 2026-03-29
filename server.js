const express = require("express");

const app = express();

const RAP_DATA = {
	6105: 858,
	30728: 858
};

app.get("/", (req, res) => {
	res.send("proxy alive");
});

app.get("/rap/:userId", (req, res) => {
	const userId = String(req.params.userId || "").trim();

	if (!/^\d+$/.test(userId)) {
		return res.status(400).json({
			success: false,
			error: "Invalid userId"
		});
	}

	const rap = RAP_DATA[userId];

	if (typeof rap !== "number") {
		return res.status(404).json({
			success: false,
			error: "RAP not found"
		});
	}

	return res.json({
		success: true,
		userId: Number(userId),
		rap
	});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log("server started on port " + PORT);
});
