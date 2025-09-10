import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { getDatabaseConfig } from '@/lib/db-config';

export async function GET() {
  try {
    const config = getDatabaseConfig();
    console.log('🔍 Debug - Database config:', config);
    
    // Test database connection
    const db = getDatabase();
    console.log('🔍 Debug - Database connected successfully');
    
    // Test tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table';
    `).all();
    
    console.log('🔍 Debug - Tables found:', tables);
    
    // Test orders table structure
    const ordersSchema = db.prepare(`
      PRAGMA table_info(orders);
    `).all();
    
    console.log('🔍 Debug - Orders table schema:', ordersSchema);
    
    // Test basic insert capability
    const testResult = db.prepare(`
      SELECT 1 as test;
    `).get();
    
    console.log('🔍 Debug - Basic query test:', testResult);
    
    return NextResponse.json({
      success: true,
      config: {
        path: config.path,
        nodeEnv: process.env.NODE_ENV,
        buildId: process.env.BUILD_ID,
        nextPhase: process.env.NEXT_PHASE
      },
      database: {
        connected: true,
        tables: tables.map(t => t.name),
        ordersSchema,
        testQuery: testResult
      }
    });
    
  } catch (error) {
    console.error('🔍 Debug - Database error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}