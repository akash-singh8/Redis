const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redis = require("ioredis")
const { Users } = require("../models/Users.js");

const userRouter = express.Router();
const redisClient = new redis();

userRouter.post("/signup", async (req, res) => {
  const { AADHAR_NO, password, village_name } = req.body;

  try {
    let user = await redisClient.get(AADHAR_NO);

    // check for user in the database
    if (!user) {
      user = await Users.findOne({ AADHAR_NO })
      if (user) {
        redisClient.set(user.AADHAR_NO, JSON.stringify({
          password: user.password,
          village_name: user.village_name
        }))
      }
    }

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const userData = {
      password: hashed_password,
      village_name,
    }
    const newUser = new Users({
      AADHAR_NO,
      ...userData
    });
    await newUser.save();

    redisClient.set(AADHAR_NO, JSON.stringify(userData));

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User registered successfully", authToken: token });
  } catch (err) {
    console.error("Error during user signup:", err);
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { AADHAR_NO, password } = req.body;
  try {
    /* 
     We need to check if the user exists in cache or not 
     if yes we'll use the result from cache instead making request to db
     if it doens't then we'll fetch the data from db and update it in cache
     and here we'll be using AADHAR_NO as a key and user's data as value
    */
    let user = JSON.parse(await redisClient.get(AADHAR_NO));

    if (!user) {
      const userDB = await Users.findOne({ AADHAR_NO: parseInt(AADHAR_NO) });
      if (!userDB) {
        return res.status(404).json({ message: "User does not exist" });
      }

      user = {
        password: userDB.password,
        village_name: userDB.village_name
      }
      redisClient.set(AADHAR_NO, JSON.stringify(user))
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged", authToken: token });
  } catch (err) {
    console.error("Error during user login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = userRouter;
