const express = require("express");
const connectDB = require("./config/db");
const { PORT, NODE_ENV } = require("./config");
const { userRoutes, chatRoutes, messageRoutes } = require("./routes");
const path = require("path");
const cors = require('cors');

// database
connectDB();

const app = express();
app.use(express.json());

// Enable CORS for all requests
app.use(cors());

// user routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Deployment stuff
const __dirname1 = path.resolve();
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("Congratulations, your API is running fine 😀");
  });
}

const server = app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Sucessfully connected to socket.io");

  socket.on("setup", (userInfo) => {
    socket.join(userInfo._id);
    console.log(`${userInfo._id} join our application`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined ${room} Room`);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.loh("User disconnected");
    socket.leave(userInfo._id);
  });
});
