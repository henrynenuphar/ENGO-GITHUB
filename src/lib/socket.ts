import { io } from 'socket.io-client';

// Connect to the same host that serves the frontend
// In production, this will be the Cloud Run URL.
// In dev, the Vite dev server runs on 5173, but we might want to connect to a locally running node server on 8080.
const URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:8080';

export const socket = io(URL, {
    autoConnect: false // We will connect manually when entering the ChallengeScreen
});
