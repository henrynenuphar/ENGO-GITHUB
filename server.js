import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React Router (Catch-all for SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Socket.io logic
const rooms = new Map(); // roomId -> Map(socket.id -> player)

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, player }) => {
    socket.join(roomId);
    
    // Store player info with socket inside the room
    socket.playerInfo = { ...player, socketId: socket.id, score: 0, status: 'waiting' };
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
    }
    const roomPlayers = rooms.get(roomId);
    roomPlayers.set(socket.id, socket.playerInfo);

    console.log(`Player ${player.name} joined room ${roomId}`);

    // Broadcast updated player list to everyone in the room
    io.to(roomId).emit('room_state_update', Array.from(roomPlayers.values()));
  });

  socket.on('update_score', ({ roomId, score }) => {
    const roomPlayers = rooms.get(roomId);
    if (roomPlayers && roomPlayers.has(socket.id)) {
        const player = roomPlayers.get(socket.id);
        player.score = score;
        
        // Broadcast all scores to the room
        io.to(roomId).emit('room_state_update', Array.from(roomPlayers.values()));
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [roomId, roomPlayers] of rooms.entries()) {
        if (roomPlayers.has(socket.id)) {
            roomPlayers.delete(socket.id);
            if (roomPlayers.size === 0) {
              rooms.delete(roomId);
            } else {
              io.to(roomId).emit('room_state_update', Array.from(roomPlayers.values()));
            }
        }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
