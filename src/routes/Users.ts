import { Router } from 'express';
import User from '../models/user';

const router = Router();


type CSVData = {
    [key: string]: string; // Adjust this type based on the CSV data structure
};

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email, gender, sessionId } = req.body;
        const user = await User.create({ name, email, gender, sessionId });
        res.status(201).json(user);
    } catch (error) {
        // Cast error as Error type
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }


});

// bulk upload users with csv file
router.post('/bulk', async (req, res) => {
    const { csvData } = req.body;

    try {
        // Assuming csvData is an array of user objects
        // Use Promise.all to wait for all insertions to complete
        await Promise.all(
            csvData.map(async (userData: CSVData) => {
                // Check if the user already exists in the database
                const existingUser = await User.findOne({ email: userData['Email Address'] });
                if (!existingUser) {
                    // If the user does not exist, create and save the user
                    const newUser = new User({
                        email: userData['Email Address'],
                        name: `${userData['First Name']} ${userData['Last Name']}`,
                        gender: userData.Gender === 'F' ? 'female' : 'male',
                    });
                    await newUser.save();
                }
            })
        );
        // Send response after all users have been added
        res.status(201).json({ message: 'All users added successfully' });
    } catch (error) {
        console.error('Error adding users:', error);
        // Handle database errors
        res.status(500).json({ message: 'Error adding users to the database' });
    }

});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().populate('sessionId');
        res.json(users);
    } catch (error) {
        // Cast error as Error type
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

// Update a user
router.put('/:id', async (req, res) => {
    try {
        const { name, email, gender, sessionId } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name, email, gender, sessionId }, { new: true });
        res.json(user);
    } catch (error) {
        // Cast error as Error type
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
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
