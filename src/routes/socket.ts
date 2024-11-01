import { Server } from 'socket.io';
import * as fs from 'fs';
import path from 'path';

import userSessionCards from '../models/userSessionCards';
import SessionUser from "../models/sessionUsers"



function listFilesInDirectory(directoryPath: string): string[] {
  const files: string[] = [];

  fs.readdirSync(directoryPath).forEach(file => {
    const fullPath = `${directoryPath}/${file}`;
    if (fs.statSync(fullPath).isFile()) {
      files.push(file);
    }
  });

  return files;
}


export default function initializeSocket(io: Server) {

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
    socket.on('userNameSelected', ({ gender }) => {
      const publicDir = path.join(__dirname, '../../public', `${gender === 'male' ? 'men' : 'women'}`)
      const fileNames = listFilesInDirectory(publicDir);
      socket.emit('filesFound', fileNames)
    });
    socket.on('verifyUserCardforASession', async ({ userId, sessionId }) => {
      try {
        // Check if the user is allowed for this session by querying the SessionUser table
        const userAllowedInSession = await SessionUser.findOne({ userId, sessionId });

        if (!userAllowedInSession) {
          // If the user is not found in the SessionUser table, they are not allowed
          socket.emit('notAllowed', { message: 'User is not allowed to submit a card for this session.' });
          return;
        }

        // Check if the user has already submitted a card for the session
        const existingRecord = await userSessionCards.findOne({ userId, sessionId });

        if (existingRecord) {
          // If the user already submitted a card, inform them
          socket.emit('recordExists', { message: 'Record already exists for this user and session.' });
        } else {
          // Allow the user to proceed
          socket.emit('goAhead');
        }

      } catch (error) {
        console.error('Error checking session and user:', error);
        socket.emit('error', { message: 'An error occurred while verifying the session.' });
      }
    });


    socket.on('cardSelected', async ({ userId, card, sessionId }) => {
      try {
        // Create a new record in the UserSessionCards collection
        const storedData = await userSessionCards.create({
          userId,
          card,
          sessionId
        });

        // Optionally, emit a success message to the client
        socket.emit('cardSelectionSuccess', { message: 'Card successfully stored.' });
        io.emit('aUserSelectedACard', { sessionId, card })
      } catch (error) {
        console.error('Error storing card selection:', error);
        // Optionally, emit an error message to the client
        socket.emit('error', { message: 'An error occurred while storing the card selection.' });
      }
    });

    socket.on('getAllSelectedCardsForASession', async ({ sessionId }) => {
      try {
        // Retrieve all cards associated with the given sessionId
        const selectedCards = await userSessionCards.find({ sessionId });

        // Optionally, emit the retrieved cards back to the client
        socket.emit('fetchedselectedCards', { cards: selectedCards });
      } catch (error) {
        console.error('Error getting other users selected cards:', error);
        // Optionally, emit an error message to the client
        socket.emit('error', { message: 'An error occurred while getting the other users cards.' });
      }
    });

  });
}


