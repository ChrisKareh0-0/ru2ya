import mongoose, { Schema, Model } from 'mongoose';

export interface ICountdown {
    _id?: string;
    title: string;
    endDate: Date;
    isVisible: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const CountdownSchema = new Schema<ICountdown>(
    {
        title: { type: String, required: true },
        endDate: { type: Date, required: true },
        isVisible: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const Countdown: Model<ICountdown> =
    mongoose.models.Countdown || mongoose.model<ICountdown>('Countdown', CountdownSchema);

export default Countdown;
