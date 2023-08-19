const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../models/Users.js");

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
  const { AADHAR_NO, password, village_name } = req.body;

  try {
    const user = await Users.findOne({ AADHAR_NO });

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const newUser = new Users({
      AADHAR_NO,
      password: hashed_password,
      village_name,
    });
    await newUser.save();

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
    const user = await Users.findOne({ AADHAR_NO });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
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
