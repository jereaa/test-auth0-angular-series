import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IEventModel extends mongoose.Document {
    title: string;
    location: string;
    startDatetime: Date;
    endDatetime: Date;
    description?: string;
    viewPublic: boolean;
}

const eventSchema = new Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    startDatetime: { type: Date, required: true },
    endDatetime: { type: Date, required: true },
    description: String,
    viewPublic: { type: Boolean, required: true },
});

export const EventSchema = mongoose.model<IEventModel>('event', eventSchema);
