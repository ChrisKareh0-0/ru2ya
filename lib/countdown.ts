import { connectDB } from './mongodb';
import Countdown, { ICountdown } from './models/Countdown';

export interface CountdownData {
    id?: string;
    title: string;
    targetDate: string;
    targetTime: string;
    isVisible: boolean;
    updatedAt?: string;
}

export async function getCountdown(): Promise<CountdownData | null> {
    await connectDB();
    const countdown = await Countdown.findOne().sort({ createdAt: -1 }).lean();

    if (!countdown) {
        return null;
    }

    const date = new Date(countdown.endDate);
    return {
        id: countdown._id?.toString(),
        title: countdown.title,
        targetDate: date.toISOString().split('T')[0],
        targetTime: date.toTimeString().substring(0, 5),
        isVisible: countdown.isVisible,
        updatedAt: countdown.updatedAt?.toISOString(),
    };
}

export async function updateCountdown(
    data: Omit<CountdownData, 'id' | 'updatedAt'>
): Promise<CountdownData | null> {
    await connectDB();

    // Construct ISO date string from date and time
    const isoDate = new Date(`${data.targetDate}T${data.targetTime}:00Z`);

    const countdown = await Countdown.create({
        title: data.title,
        endDate: isoDate,
        isVisible: data.isVisible,
    });

    const date = new Date(countdown.endDate);
    return {
        id: countdown._id?.toString(),
        title: countdown.title,
        targetDate: date.toISOString().split('T')[0],
        targetTime: date.toTimeString().substring(0, 5),
        isVisible: countdown.isVisible,
        updatedAt: countdown.updatedAt?.toISOString(),
    };
}
