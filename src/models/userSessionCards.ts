import { Schema, model, Document } from 'mongoose';
import {ISession} from "./session"
import { IUser } from './user';

export interface IUserSessionCards extends Document {
    userId: IUser;  // Reference the User model
    sessionId: ISession;  // Reference the Session model
    card: string;
    name?: string;
    title?: string;
  }

const UserSessionCardSchema: Schema = new Schema({
    card: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

export default model<IUserSessionCards>('UserSessionCards', UserSessionCardSchema);
