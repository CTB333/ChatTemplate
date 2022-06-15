const DBRoom = require("../models/room");

class Room {
  #id;
  #name;
  #users;
  #connected;
  #messages;

  constructor(roomDoc) {
    this.#id = roomDoc?._id;
    this.#connected = roomDoc?.connected;
    this.#messages = roomDoc?.messages;
    this.#name = roomDoc?.name;
    this.#users = roomDoc?.users;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get users() {
    return this.#users;
  }

  get connected() {
    return this.#connected;
  }

  get messages() {
    return this.#messages;
  }

  obj() {}

  static async findById(id) {
    const doc = await DBRoom.findById(id);
    return new Room(doc);
  }

  async saveData() {
    const doc = await DBRoom.findById(this.#id);
    doc.name = this.#name;
    doc.users = this.#users;
    doc.connected = this.#connected;
    doc.messages = this.#messages;
    await doc?.save();
  }
}

module.exports = Room;
