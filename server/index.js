const express = require("express");
const dotenv = require("dotenv");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Hello Universe</h1>");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
