const express = require("express");
const jwt = require("jsonwebtoken");
const { Users } = require("../models/Users.js");

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
  const { AADHAR_NO, password, village_name } = req.body;

  try {
    const user = await Users.findOne({ AADHAR_NO });

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }
    const newUser = new Users({
      AADHAR_NO,
      password,
      village_name,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User registered successfully", authToken: token });
  } catch (err) {
    console.error("Error during user signup:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = userRouter;
