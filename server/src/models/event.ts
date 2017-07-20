import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IEventModel extends mongoose.Document {
    title: string;
    location: string;
    startDateTime: Date;
    endDateTime: Date;
    description?: string;
    viewPublic: boolean;
}

const eventSchema = new Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    description: String,
    viewPublic: { type: Boolean, required: true },
});

export const EventSchema = mongoose.model<IEventModel>('event', eventSchema);
