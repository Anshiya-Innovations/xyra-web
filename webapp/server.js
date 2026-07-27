const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "webapp")));

app.get("/", (req, res) => {
    res.redirect("login.view.html");
});

const PORT = 8081;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});