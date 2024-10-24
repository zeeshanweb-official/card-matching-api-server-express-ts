import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  title: string;
}

const SessionSchema: Schema = new Schema({
  title: { type: String, required: true },
});

export default model<ISession>('Session', SessionSchema);
