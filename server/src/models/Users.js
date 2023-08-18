const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  AADHAR_NO: { type: Number, require: true, unique: true },
  password: { type: String, require: true },
  village_name: { type: String, require: true },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = {
  Users: UserModel,
};
