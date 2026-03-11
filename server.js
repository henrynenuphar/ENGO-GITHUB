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
const rooms = new Map(); // roomId -> { players: Map(socket.id -> player), answersReceived: number }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, player }) => {
    socket.join(roomId);
    
    // Store player info with socket inside the room
    socket.playerInfo = { ...player, socketId: socket.id, score: 0, status: 'waiting', hasAnswered: false };
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: new Map(), answersReceived: 0 });
    }
    const roomState = rooms.get(roomId);
    roomState.players.set(socket.id, socket.playerInfo);

    console.log(`Player ${player.name} joined room ${roomId}`);

    // Broadcast updated player list to everyone in the room
    io.to(roomId).emit('room_state_update', Array.from(roomState.players.values()));
  });

  socket.on('submit_answer', ({ roomId, score }) => {
    const roomState = rooms.get(roomId);
    if (!roomState) return;
    
    const player = roomState.players.get(socket.id);
    if (player && !player.hasAnswered) {
        player.score = score;
        player.hasAnswered = true;
        roomState.answersReceived += 1;
        
        // Broadcast updated scores
        io.to(roomId).emit('room_state_update', Array.from(roomState.players.values()));

        console.log(`Room ${roomId}: ${roomState.answersReceived}/${roomState.players.size} answers received.`);

        // Check if everyone has answered
        if (roomState.answersReceived >= roomState.players.size) {
            console.log(`Room ${roomId}: Round finished. Broadcasting results.`);
            io.to(roomId).emit('round_finished');

            // Reset for next round after a delay
            setTimeout(() => {
                if (rooms.has(roomId)) {
                    const currentRoomState = rooms.get(roomId);
                    currentRoomState.answersReceived = 0;
                    for (const [, p] of currentRoomState.players) {
                        p.hasAnswered = false;
                    }
                    console.log(`Room ${roomId}: Broadcasting next question.`);
                    io.to(roomId).emit('next_question');
                }
            }, 3000); // 3 second delay for leaderboard
        }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [roomId, roomState] of rooms.entries()) {
        if (roomState.players.has(socket.id)) {
            const player = roomState.players.get(socket.id);
            if (player.hasAnswered) {
                // If they already answered this round, decrement since they left
                roomState.answersReceived -= 1; 
            }
            
            roomState.players.delete(socket.id);
            
            if (roomState.players.size === 0) {
              rooms.delete(roomId);
            } else {
              io.to(roomId).emit('room_state_update', Array.from(roomState.players.values()));
              
              // Edge case: someone disconnects while we're waiting for ONLY them
              if (roomState.answersReceived >= roomState.players.size && roomState.players.size > 0) {
                 io.to(roomId).emit('round_finished');
                 setTimeout(() => {
                     if (rooms.has(roomId)) {
                         const currentRoomState = rooms.get(roomId);
                         currentRoomState.answersReceived = 0;
                         for (const [, p] of currentRoomState.players) {
                             p.hasAnswered = false;
                         }
                         io.to(roomId).emit('next_question');
                     }
                 }, 3000);
              }
            }
        }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
