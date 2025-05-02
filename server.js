const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

mongoose.connect("mongodb://localhost:27017/collab", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Document = mongoose.model("Document", new mongoose.Schema({
  data: Object,
}));

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await Document.findById(documentId) || await Document.create({ _id: documentId, data: "" });
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

server.listen(3001, () => console.log("Server running on port 3001"));
