import { NextRequest, NextResponse } from 'next/server';
import { getCountdown, updateCountdown } from '@/lib/countdown';

export const dynamic = 'force-dynamic';

// Get countdown data
export async function GET() {
  try {
    const data = await getCountdown();

    if (!data) {
      // Return default if no data found
      return NextResponse.json({
        title: 'Limited Time Offer',
        targetDate: '2024-12-31',
        targetTime: '23:59',
        isVisible: true
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading countdown data:', error);
    return NextResponse.json(
      { error: 'Failed to read countdown data' },
      { status: 500 }
    );
  }
}

// Update countdown data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, targetDate, targetTime, isVisible } = body;

    // Validate required fields
    if (!title || !targetDate || !targetTime || typeof isVisible !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: title, targetDate, targetTime, isVisible' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(targetTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM' },
        { status: 400 }
      );
    }

    const updated = await updateCountdown({
      title,
      targetDate,
      targetTime,
      isVisible
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to save countdown data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Countdown updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating countdown data:', error);
    return NextResponse.json(
      { error: 'Failed to update countdown data' },
      { status: 500 }
    );
  }
}
