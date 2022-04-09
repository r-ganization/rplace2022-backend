import express from "express";

const app = express();
app.use(express.json());

app.all("/", (req, res) => {
	res.send(`Recieved ${req.method} request`);
});

app.listen(3036, () => {
	console.log("Server started on port 3036");
});