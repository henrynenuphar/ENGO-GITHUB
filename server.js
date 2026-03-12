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

// Store state per room
const rooms = new Map();
// Structure: 
// rooms.get('roomId') -> { 
//   players: Map(socketId -> { id, name, score, avatarImage, hasAnswered, phoneNumber }),
//   answersReceived: number,
//   matchStartTime: number
// }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, player }) => {
    const { name, avatarImage, phoneNumber } = player; // Destructure player object
    
    socket.join(roomId);
    
    // Store player info with socket inside the room
    socket.playerInfo = { ...player, socketId: socket.id, score: 0, status: 'waiting', hasAnswered: false };
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            players: new Map(),
            answersReceived: 0,
            status: 'waiting',
            timeLeft: 15,
            timerInterval: null
        });

        // Start countdown for the room
        const newState = rooms.get(roomId);
        newState.timerInterval = setInterval(() => {
            if (newState.timeLeft > 0) {
                newState.timeLeft -= 1;
                io.to(roomId).emit('timer_update', newState.timeLeft);
            } else {
                // Time's up
                clearInterval(newState.timerInterval);
                newState.status = 'playing';
                io.to(roomId).emit('start_game');
            }
        }, 1000);
    }

    const roomState = rooms.get(roomId);
    
    // Fix 1 account 2 players: remove existing connection with the same name
    for (const [existingSocketId, existingPlayer] of roomState.players.entries()) {
        if (existingPlayer.name === name) {
            roomState.players.delete(existingSocketId);
            if (existingPlayer.hasAnswered) {
                roomState.answersReceived = Math.max(0, roomState.answersReceived - 1);
            }
        }
    }

    roomState.players.set(socket.id, {
        id: socket.id,
        name,
        score: 0,
        avatarImage,
        hasAnswered: false,
        phoneNumber: phoneNumber || 'N/A' // Capture phone number for Sheets
    });

    console.log(`User ${socket.id} (${name}) joined room ${roomId}`);
    
    // Broadcast updated player list
    io.to(roomId).emit('room_state_update', Array.from(roomState.players.values()));

    // If the game is already playing or starting, tell this player immediately
    if (roomState.status === 'playing' || roomState.timeLeft === 0) {
        socket.emit('start_game');
    } else {
        socket.emit('timer_update', roomState.timeLeft);
    }
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

  socket.on('game_finished', async ({ roomId }) => {
    if (rooms.has(roomId)) {
        const roomState = rooms.get(roomId);
        console.log(`Room ${roomId}: Game finished. Sending results to Google Sheets.`);
        
        // Convert Map to Array and Sort to calculate ranks
        const playersArr = Array.from(roomState.players.values());
        playersArr.sort((a, b) => b.score - a.score);
        
        const webhookUrl = 'https://script.google.com/macros/s/AKfycby_vkQ1rC7WjP3WV-vmFOcgc0ch5yPY0VnJbZ-ncULvXu-E5owqkZgSoC15EpJPa0Y/exec';
        
        // Use Promise.all to send all players asynchronously without blocking
        Promise.all(playersArr.map((player, index) => {
             const url = new URL(webhookUrl);
             url.searchParams.append('room', roomId);
             url.searchParams.append('playerName', player.name);
             url.searchParams.append('phoneNumber', player.phoneNumber || 'N/A');
             url.searchParams.append('score', player.score.toString());
             url.searchParams.append('rank', (index + 1).toString());
            
            return fetch(url.toString(), {
                method: 'GET'
            }).catch(e => console.error("Webhook GET failed:", e));
        })).then(() => console.log(`Room ${roomId}: All results sent.`));

        // Clean up room after game finishes
        if (roomState.timerInterval) {
            clearInterval(roomState.timerInterval);
        }
        rooms.delete(roomId);
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
              io.to(roomId).emit('room_state_update', {
                  players: Array.from(roomState.players.values()),
                  matchStartTime: roomState.matchStartTime
              });
              
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
