const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./Routes/UserRouter");
const chatRoutes = require("./Routes/chatRoutes");
const MessageRoutes = require("./Routes/MessageRouter");

const app = express();
dotenv.config();

const server = app.listen(process.env.port, () => {
  console.log(`Port is connected on : ${process.env.port}`);
});

mongoose
  .connect(process.env.db)
  .then(() => console.log("DB Connected"))
  .catch(() => console.log("DB not connected"));
app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", MessageRoutes);

const io = require("socket.io")(server, {
  pingTime: 60000,
  cors: {
    origin: "http://localhost:3001",
  },
});

io.on("connection", (socket) => {
  console.log("connected to io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined in room :" + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.user not found");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("User disconnected");

    socket.leave(user._id);
  });
});
