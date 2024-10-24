import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from "cors"
import initializeSocket from './routes/socket';

import connectDB from './db';
import userRoutes from './routes/Users';
import sessionRoutes from './routes/Sessions';
import multer from 'multer';
import path from 'path'; // Import   

import { ClientToServerEvents, ServerToClientEvents } from "./models/socketTypes"

const app: Application = express();
app.use(cors())

app.use('/public', express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
export const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
	cors: {
		origin: "*",
		credentials: true,
	},
});

// Configure multer for file storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/'); // Set your upload directory
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	}
});

export const upload = multer({ storage });

// Connect to MongoDB
connectDB();

// Set up middleware
app.use(express.json());

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);


// Define a basic route
app.get('/', (req, res) => {
	res.send('Hello World!');
});

// Initialize Socket.IO events in a separate file
initializeSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
