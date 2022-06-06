const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: String,
  users: [
    new Schema({
      userId: mongoose.Types.ObjectId,
      userName: String,
    }),
  ],
  connected: [mongoose.Types.ObjectId],
  messages: [
    new Schema({
      text: String,
      userId: String,
      date: String,
    }),
  ],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
