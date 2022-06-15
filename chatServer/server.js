const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const userControl = require("./controller/user");
const roomControl = require("./controller/room");

const app = express();
const port = 3030;

app.use(cors());

const mongoUrl = "mongodb://localhost:27017/Chats";

let DB = null;
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => {
    console.log("mongo connected");
    console.log();
    DB = db;
  })
  .catch(() => {
    console.log("Database Failed");
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8081",
    methods: ["GET", "POST"],
  },
});

io.on("connect", async (socket) => {
  logMessage(`${socket.id} connected`, false);

  socket.on("login_id", async (data) => {
    let { id } = data;
    let res = {};

    try {
      let user = await userControl.findUser(id);
      res.userName = user.userName;
      res.rooms = user.rooms;
      res.id = user._id;
      socket.data.user = user;
      socket.emit("login_id_success", res);
      logMessage(`${socket.id} logged in as ${user.userName}`);
    } catch (e) {
      socket.emit("login_id_err");
    }
  });

  socket.on("login", async (data) => {
    let { userName, password } = data;
    let res = {};

    try {
      let user = await userControl.loginUser(userName, password);

      let allSockets = await io.fetchSockets();

      for (let sock of allSockets) {
        if (!sock.data || !sock.data.user) {
          continue;
        }

        let sId = sock.data.user._id;

        if (sId.toString() === user._id.toString()) {
          throw new Error("Account allready in use");
        }
      }

      res.userName = user.userName;
      res.rooms = user.rooms;
      res.id = user._id;
      socket.data.user = user.toObject();
      socket.emit("login_success", res);
      logMessage(`${socket.id} logged in as ${user.userName}`);
    } catch (e) {
      res.err = e.message;
      socket.emit("login_err", res);
    }
  });

  socket.on("logout", () => {
    socket.data = {};
  });

  socket.on("disconnect", async () => {
    try {
      await roomControl.disconnectUserFromRoom(socket.data.user.id);
    } catch (e) {}
    logMessage(`${socket.id} disconnected`);
  });

  socket.on("sign_up", async (data) => {
    let { userName, password } = data;
    let res = {};

    try {
      let user = await userControl.addNewUser(userName, password);

      io.allSockets().then((sockets) => {
        for (let s in sockets) {
          if (s.data.user._id === user._id) {
            throw new Error(
              `Someone is allready signed in as ${user.userName}`
            );
          }
        }
      });

      res.userName = user.userName;
      res.rooms = user.rooms;
      res.id = user._id;
      socket.data.user = user.toObject();
      socket.emit("sign_up_success", res);
    } catch (e) {
      socket.emit("sign_up_err", res);
    }
  });

  socket.on("search_users", async (data) => {
    let { query } = data;
    let res = {};
    try {
      let users = await userControl.searchUserNames(query);
      res.query = query;
      res.users = users;
      socket.emit("search_users_success", res);
    } catch (e) {
      res.err = e.message;
      socket.emit("search_users_err", res);
    }
  });

  socket.on("connect_users", async (data) => {
    // update the connected users on the room

    let { id1, id2, roomId } = data;
    try {
      let roomDoc = null;
      let created = false;
      let user1 = null;
      let user2 = null;

      if (roomId) {
        try {
          roomDoc = await roomControl.findRoomById(roomId);
        } catch (e) {
          roomDoc = await roomControl.createNewRoom(id1, id2);
        }
      } else {
        roomDoc = await roomControl.createNewRoom(id1, id2);
        created = true;
      }

      roomDoc = await roomControl.openRoom(id1, roomDoc._id);

      let room = roomControl.roomObj(roomDoc);

      if (created) {
        user1 = await userControl.findUser(id1);
        user2 = await userControl.findUser(id2);

        socket.data.user.rooms = user1.rooms;
        io.emit("update_rooms", { id: id1, rooms: user1.rooms });
        io.emit("update_rooms", { id: id2, rooms: user2.rooms });
      }

      socket.join(room.name);
      socket.emit("connect_users_success", { room });
      logMessage(
        `${created ? "created" : "joined"} : ${room.name} : ${JSON.stringify(
          room.connected
        )}`
      );
    } catch (e) {
      console.log(e.message);
    }
  });

  socket.on("get_user_data", async (data) => {
    let { id } = data;
    console.log(id);
    try {
      let { id: userId, userName } = await userControl.findUserObj(
        id.toString()
      );
      socket.emit("get_user_data_success", { userId, userName });
    } catch (e) {
      console.log("Error in get_user_name: " + e);
    }
  });

  socket.on("leave_room", async (data) => {
    let { id, roomId } = data;
    console.log("Leave Room");
    console.log();
    try {
      await roomControl.closeRoom(id, roomId);
      let user = await userControl.findUser(id);
      io?.emit("update_rooms", { id: id, rooms: user.rooms });
    } catch (e) {
      console.log("leaving room failed: " + e);
    }
  });

  socket.on("msg_room", async (data) => {
    let { roomName, message } = data;
    try {
      let room = await roomControl.messageRoom(roomName, message, io);
      let messages = room.messages;
      let name = room.name;
      io.to(name).emit("msg_room_success", { messages });
      logMessage(`Message Sent To - ${name}`, false);
    } catch (e) {
      console.log("Error");
      logMessage(e.message);
    }
  });

  socket.on("get_room_msg", async (data) => {
    let { roomId } = data;

    try {
      logMessage("Get Room Message Updates Read");
      let room = roomControl.roomObj(await roomControl.findRoomById(roomId));
      io.to(room.name).emit("msg_room_success", { messages: room.messages });
    } catch (e) {}
  });

  socket.on("master_reset_rooms", async () => {
    try {
      await roomControl.masterResetRooms();
      logMessage("Master Reset Rooms done");
    } catch (e) {
      logMessage("Master Reset Error");
    }
  });
});

server.listen(port, () => {
  logMessage(`Server running on port ${port}`);
});

const logMessage = (msg, ending = true) => {
  console.log(msg);
  if (ending) {
    console.log();
  }
};
