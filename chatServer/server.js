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

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => {
    console.log("Database Connected");
    // roomControl.masterResetRooms();
    // logMessage("Master Reset Rooms done");
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
      socket.data.user = user;
      socket.emit("login_success", res);
    } catch (e) {
      res.err = e.message;
      socket.emit("login_err", res);
    }
  });

  socket.on("logout", () => {
    socket.data = {};
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
      socket.data.user = user;
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
    let { id1, id2, roomId } = data;
    try {
      let r = null;
      let created = false;
      let user1 = null;
      let user2 = null;

      if (roomId) {
        r = await roomControl.findRoomById(roomId);
      } else {
        r = await roomControl.createNewRoom(id1, id2);
        created = true;
      }

      let room = roomControl.roomObj(r);

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
        `${socket.id} - ${created ? "created" : "joined"} ${room.name}`
      );
    } catch (e) {
      console.log(e.message);
    }
  });

  socket.on("msg_room", async (data) => {
    let { roomName, message } = data;
    console.log("Message");
    try {
      let room = await roomControl.messageRoom(roomName, message);
      let { messages, name } = room;
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

  socket.on("disconnect", () => {
    logMessage(`${socket.id} disconnected`);
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
