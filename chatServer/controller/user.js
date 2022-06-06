const User = require("../models/user");
const bcrypt = require("bcrypt");

const addNewUser = async (userName, password) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  let user = new User({
    userName,
    password: hashed,
    rooms: [],
  });

  user = await user.save();

  return user;
};

const loginUser = async (userName, password) => {
  let user = await User.find({ userName });

  if (user.length == 0) {
    throw new Error("User Name not found");
  }

  user = user[0];

  let hashed = user.password;

  let equal = await bcrypt.compare(password, hashed);

  if (equal) {
    return user;
  }

  throw new Error("Credentials Are Invalid");
};

const findUser = async (id) => {
  let user = await User.findById(id);

  if (user) {
    return user;
  }

  throw new Error("User Id Invalid Cannot Sign In");
};

const findUserObj = async (id) => {
  let user = await findUser(id);
  return {
    id: user._id,
    userName: user.userName,
    rooms: user.rooms,
  };
};

const searchUserNames = async (queryText) => {
  let matches = await User.find({
    userName: { $regex: queryText, $options: "i" },
  }).sort({
    userName: 1,
  });
  if (!matches || matches.length == 0) {
    throw new Error(`(${queryText}) could not be found`);
  }

  let users = matches.map((v, i, _) => {
    return {
      id: v._id,
      userName: v.userName,
      rooms: v.rooms,
    };
  });
  return users;
};

const addRoom = async (userId, otherId, room) => {
  let user = await findUser(userId);
  let otherGuy = await findUser(otherId);

  let userRoomObj = {
    roomId: room._id,
    roomName: room.name,
    other: {
      userId: otherGuy._id,
      userName: otherGuy.userName,
    },
  };

  let otherGuyRoomObj = {
    roomId: room._id,
    roomName: room.name,
    other: {
      userId: user._id,
      userName: user.userName,
    },
  };

  user.rooms.push(userRoomObj);
  otherGuy.rooms.push(otherGuyRoomObj);
  user = await user.save();
  otherGuy = await otherGuy.save();
  console.log("Room Synced");
  console.log(user);
  console.log();
};

//users.find({ $text: { $search: "B", $caseSensitive: false } }).pretty()
//users.find({ $text: { $search: {$regex: "bo", $options: "i"}, $caseSensitive: false } }).pretty()
//users.find({ "userName": {$regex: "bo", $options: "i"} }).pretty()
//users.find({  }).pretty()

module.exports = {
  addNewUser,
  loginUser,
  findUser,
  findUserObj,
  searchUserNames,
  addRoom,
};
