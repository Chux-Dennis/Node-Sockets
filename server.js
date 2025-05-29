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
const PORT = 3001;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store messages
const messages = [];

// Render the EJS template with message history
app.get("/new", (req, res) => {
    console.log('Rendering index.ejs with messages:', messages);
    res.render('index', { messages });
});

// Optional: Add the root route if desired
app.get("/", (req, res) => {
    console.log('Rendering index.ejs for root route with messages:', messages);
    res.render('index', { messages });
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Notify all clients of new user
    io.emit('user connected', socket.id);

    // Handle incoming chat messages
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        messages.push(msg);
        io.emit('chat message', msg);
    });

    // Handle typing events
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.id);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', socket.id);
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