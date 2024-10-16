import express from "express";
import * as socketio from "socket.io"

const app = express();
const http = require("http").Server(app);
const io = new socketio.Server(http, {
  cors: {
    origin: "*"
  }
});

const socketsStatus: {
  [id: string]: {
    mute?: boolean;
    online?: boolean;
  }
} = {};

app.set("view engine", "handlebars");

const PORT = 3000;

http.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});


io.on("connection", socket => {
  const socketId = socket.id;
  socketsStatus[socketId] = {};

  console.log("connect");

  socket.on("voice", data => {
    for (const id in socketsStatus) {
      socket.broadcast.to(id).emit("voice", data);
      socket.emit("voice", data);
      // if (id != socketId && !socketsStatus[id].mute && socketsStatus[id].online) {
      //   socket.broadcast.to(id).emit("voice", newData);
      // }
    }
  });

  socket.on("userInformation", data => {
    socketsStatus[socketId] = data;

    io.sockets.emit("usersUpdate", socketsStatus);
  });

  socket.on("disconnect", () => {
    delete socketsStatus[socketId];
    console.log("disconnect");
  });
});





