const express = require("express");
const redis = require("ioredis");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const userRouter = require("./routes/users.js");

const app = express();
dotenv.config();

app.use(express.json());
app.use("/", userRouter);

const PORT = process.env.PORT || 3000;
const redisClient = new redis();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("--- Database Connected ---"));

app.get("/", async (req, res) => {
  const key = "name";

  try {
    const data = await redisClient.get(key);

    // check if data exists then use it, else fetch from db and store in cache
    if (data != null) {
      const response = {
        message: "Found data",
      };
      response[key] = data;

      return res.json(response);
    } else {
      // make request to database and store in cache
      redisClient.set(key, "Akash");
      return res.json({ message: "Added data" });
    }
  } catch (err) {
    console.log(err);
  }

  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
