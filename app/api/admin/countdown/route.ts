import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const COUNTDOWN_FILE = join(process.cwd(), 'data', 'countdown.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    const fs = require('fs');
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Get countdown data
export async function GET() {
  try {
    ensureDataDir();
    
    if (!existsSync(COUNTDOWN_FILE)) {
      // Return default countdown data if file doesn't exist
      const defaultData = {
        title: 'Limited Time Offer',
        targetDate: '2024-12-31',
        targetTime: '23:59',
        isVisible: true
      };
      
      // Save default data
      writeFileSync(COUNTDOWN_FILE, JSON.stringify(defaultData, null, 2));
      return NextResponse.json(defaultData);
    }

    const data = readFileSync(COUNTDOWN_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
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
    ensureDataDir();
    
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

    const countdownData = {
      title,
      targetDate,
      targetTime,
      isVisible
    };

    // Save to file
    writeFileSync(COUNTDOWN_FILE, JSON.stringify(countdownData, null, 2));

    return NextResponse.json({ 
      message: 'Countdown updated successfully',
      data: countdownData 
    });
  } catch (error) {
    console.error('Error updating countdown data:', error);
    return NextResponse.json(
      { error: 'Failed to update countdown data' },
      { status: 500 }
    );
  }
}
