import { Router } from 'express';
import Session from '../models/session';
import SessionUserModel from '../models/sessionUsers';
import UserSessionCards from '../models/userSessionCards';
import { createCsvString } from '../utils/csv'; // Assuming a CSV creation utility


const router = Router();

// Create a new session
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        const session = await Session.create({ title });
        res.status(201).json(session);
    } catch (error) {
        // Cast error as Error type
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

// Get all sessions with user card submission count
router.get('/', async (req, res) => {
    try {
      // Aggregate sessions and count how many users submitted cards for each session
      const sessions = await Session.aggregate([
        {
          $lookup: {
            from: 'usersessioncards', // Collection name for UserSessionCards
            localField: '_id',        // Field in Session to match
            foreignField: 'sessionId',// Field in UserSessionCards to match
            as: 'submittedCards'      // Alias for the matched data
          }
        },
        {
          $addFields: {
            cardSubmissionCount: { $size: '$submittedCards' } // Count the submissions for each session
          }
        }
      ]);
  
      res.json(sessions);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  });
  
// Get a specific session with users
router.get('/:id', async (req, res) => {
    try {
        // Step 1: Find the session by its ID
        const session = await Session.findById(req.params.id);
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return
        }

        // Step 2: Find users associated with this session from the pivot table
        const sessionUsers = await SessionUserModel.find({ sessionId: req.params.id }).populate('userId', 'name email'); // Assuming userId in SessionUserModel references User

        // Step 3: Return the session and associated users
        res.status(200).json({
            ...session.toObject(),  // Convert the session document to a plain object
            users: sessionUsers.map((sessionUser) => sessionUser.userId)  // Add the users array inside the session object
        });
    } catch (error) {
        // Handle errors
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});


router.get('/usersAndCards/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;

        // Find all UserSessionCard documents associated with the given sessionId
        const userSessionCards = await UserSessionCards.find({ sessionId })
        .populate('userId', 'name') // Populate the 'userId' field with the 'name' property from the 'User' model
        .populate('sessionId', 'title') // Populate the 'sessionId' field with the 'title' property from the 'Session' model;

        // Create a CSV string from the userSessionCards data
        const csvString = createCsvString(userSessionCards);

        // Set the response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="usersAndCards.csv"`);

        // Send the CSV string as the response body
        res.send(csvString);
    } catch (error) {
        console.error('Error fetching user session cards:', error);
        res.status(500).send('An error occurred while fetching user session cards.');
    }
});

// Update a session and its associated users
router.put('/:id', async (req, res) => {
    const { title, users } = req.body;

    try {
        // Step 1: Update the session title
        const session = await Session.findByIdAndUpdate(req.params.id, { title }, { new: true });
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return
        }

        // Step 2: Delete all users associated with this session
        await SessionUserModel.deleteMany({ sessionId: req.params.id });

        // Step 3: Add new users to the session
        if (users && users.length > 0) {
            const sessionUsers = users.map((userId: string) => ({
                sessionId: req.params.id,
                userId,
            }));

            // Insert the new users in bulk
            await SessionUserModel.insertMany(sessionUsers);
        }

        res.json({ message: 'Session and users updated successfully', session });
    } catch (error) {
        // Handle errors
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

// Delete a session
router.delete('/:id', async (req, res) => {
    try {
        await Session.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (error) {
        // Cast error as Error type
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

export default router;
