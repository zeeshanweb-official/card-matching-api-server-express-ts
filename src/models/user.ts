import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    sessionId?: string;
    gender: string;

}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
});

export default model<IUser>('User', UserSchema);
