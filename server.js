import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 3000;

app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const messages = [];

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send message history to new user
    messages.forEach((msg) => socket.emit('chat message', msg));

    // Notify all clients of new user
    io.emit('user connected', socket.id);

    // Handle incoming chat messages
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        messages.push(msg);
        io.emit('chat message', msg); // Broadcast to all clients
    });

    // Notify all clients when user disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        io.emit('user disconnected', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});