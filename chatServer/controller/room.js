const userControl = require("./user");
const User = require("../models/user");
const Room = require("../models/room");

const findRoomById = async (id) => {
  let room = await Room.findById(id);
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
  console.log("Create Room Called");
  let user1 = await userControl.findUserObj(id1);
  let user2 = await userControl.findUserObj(id2);

  const name = `${user1.id}-${user2.id}`;
  const users = [user1.id.toString(), user2.id.toString()];
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

const messageRoom = async (roomName, msg, io = null) => {
  let room = await findRoomByName(roomName);
  let roomObject = roomObj(room);
  let message = createMessageDoc(msg, room.users);

  let to = message.to;

  if (!roomObject.connected.includes(to)) {
    let other = await userControl.findUser(to);
    let otherPersonsRooms = other.rooms;
    for (let otherRoom of otherPersonsRooms) {
      if (otherRoom.roomId.toString() == roomObject.id.toString()) {
        otherRoom.newMsg = true;
      }
    }
    other = await other.save();
    io?.emit("update_rooms", { id: other._id, rooms: other.rooms });
  } else {
    message.read = true;
    message.readAt = new Date().toISOString();
  }

  room.messages.push(message);

  await room.save();
  return room;
};

const openRoom = async (id, roomId) => {
  let room = await findRoomById(roomId.toString());
  let user = await userControl.findUser(id);
  let userRoomIndex = await userControl.findRoomIndex(id, roomId);
  let addToArray = true;
  for (let userId of room?.connected) {
    if (id == userId) {
      addToArray = false;
    }
  }

  if (addToArray) {
    let userRoom = user.rooms[userRoomIndex];
    let messages = room.messages;

    room.connected.push(id);
    userRoom.newMsg = false;
    for (let msg of messages) {
      if (msg.to == id && msg.read == false) {
        msg.read = true;
        msg.readAt = new Date().toISOString();
      }
    }

    await user.save();
    await room.save();
  }

  return room;
};

const closeRoom = async (id, roomId) => {
  let room = await findRoomById(roomId.toString());

  room.connected.pull(id);
  await room.save();
  console.log("Connected - " + JSON.stringify(room.connected));
  return room;
};

const createMessageDoc = (msg, users) => {
  let other = null;

  for (let user of users) {
    if (msg.from != user.toString()) {
      other = user;
    }
  }

  return {
    ...msg,
    to: other,
  };
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

const disconnectUserFromRoom = async (id) => {
  let user = await userControl.findUser(id);
  user = user.toObject();

  for await (let userRoom of user.rooms) {
    let roomId = userRoom.roomId;
    await closeRoom(user._id, roomId);
  }
};

module.exports = {
  findRoomById,
  findRoomByName,
  masterResetRooms,
  createNewRoom,
  messageRoom,
  roomObj,
  disconnectUserFromRoom,
  openRoom,
  closeRoom,
};
