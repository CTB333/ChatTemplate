const userControl = require("./user");
const User = require("../models/user");
const Room = require("../models/room");

const findRoomById = async (id) => {
  let room = await Room.findById(id);
  console.log(room);
  if (room) {
    return room;
  }

  throw new Error("Room Could Not Be Found By Id");
};

const roomObj = (room) => {
  return {
    id: room._id,
    name: room.name,
    users: room.users,
    connected: room.connected,
    messages: room.messages,
  };
};

const findRoomByName = async (name) => {
  let rooms = await Room.find({ name: name });
  if (rooms || rooms.length > 0) {
    return rooms[0];
  }

  throw new Error("Room Could Not Be Found By Name");
};

const createNewRoom = async (id1, id2) => {
  let user1 = await userControl.findUserObj(id1);
  let user2 = await userControl.findUserObj(id2);

  const name = `${user1.id}-${user2.id}`;
  const users = [
    { userId: user1.id, userName: user1.userName },
    { userId: user2.id, userName: user2.userName },
  ];
  const connected = [];
  const messages = [];

  let room = new Room({
    name: name,
    users: users,
    connected: connected,
    messages: messages,
  });

  try {
    room = await room.save();

    await userControl.addRoom(user1.id, user2.id, room);
  } catch (e) {
    throw new Error("Room could not be saved to a user");
  }
  return room;
};

const messageRoom = async (roomName, message) => {
  let room = await findRoomByName(roomName);
  room.messages.push(message);
  await room.save();
  return room;
};

const masterResetRooms = async () => {
  let users = await User.find({});
  for await (let user of users) {
    if (user.rooms.length > 0) {
      user.rooms = [];
      await user.save();
    }
  }
  await Room.deleteMany({});
  console.log("Rooms And Users Cleared");
};

module.exports = {
  findRoomById,
  findRoomByName,
  masterResetRooms,
  createNewRoom,
  messageRoom,
  roomObj,
};
