import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    
    // Get all table names
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table';
    `).all() as Array<{ name: string }>;
    
    const result: any = { tables: [] };
    
    // Get schema for each table
    for (const table of tables) {
      if (table.name.startsWith('sqlite_')) continue; // Skip sqlite internal tables
      
      const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
      result.tables.push({
        name: table.name,
        columns: schema
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}