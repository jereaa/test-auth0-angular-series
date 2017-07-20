import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IRsvpModel extends mongoose.Document {
    userId: string;
    name: string;
    eventId: string;
    attending: boolean;
    guests?: number;
    comments?: string;
}

const rsvpSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    eventId: { type: String, required: true },
    attending: { type: Boolean, required: true },
    guests: Number,
    comments: String,
});

export const RsvpSchema = mongoose.model<IRsvpModel>('Rsvp', rsvpSchema);
