const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Document = require("./models/Document");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  // Allow frontend access
    }
});

// MongoDB connect karo
mongoose.connect("mongodb://127.0.0.1:27017/collab-doc", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const defaultValue = "";

// Socket.io ka kaam
io.on("connection", socket => {
    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId);
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

// Document create/find function
async function findOrCreateDocument(id) {
    if (id == null) return;

    const document = await Document.findById(id);
    if (document) return document;

    return await Document.create({ _id: id, data: defaultValue });
}

// Server run karna
server.listen(3001, () => {
    console.log("Server is running on port 3001");
});
