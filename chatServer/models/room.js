const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: String,
  users: [String],
  connected: [String],
  messages: [
    new Schema({
      text: String,
      from: String,
      to: String,
      date: String,
      read: Boolean,
      readAt: String,
    }),
  ],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
