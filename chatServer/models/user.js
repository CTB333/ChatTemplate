const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  rooms: [
    new Schema({
      roomId: mongoose.Types.ObjectId,
      roomName: String,
      newMsg: Boolean,
      other: new Schema({
        userId: String,
        userName: String,
      }),
    }),
  ],
});

UserSchema.index({ userName: "text" });

const User = mongoose.model("User", UserSchema);

module.exports = User;
