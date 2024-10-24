import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the pivot document
interface SessionUser extends Document {
  sessionId: mongoose.Types.ObjectId;  // Reference to session
  userId: mongoose.Types.ObjectId;     // Reference to user
}

// Define the schema for the pivot table
const SessionUserSchema: Schema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

// Create the model from the schema
const SessionUserModel = mongoose.model<SessionUser>('SessionUser', SessionUserSchema);

export default SessionUserModel;
