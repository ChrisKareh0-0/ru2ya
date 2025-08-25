import path from 'path';
import fs from 'fs';

export interface DatabaseConfig {
  path: string;
  backupPath?: string;
}

export function getDatabaseConfig(): DatabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBuildTime = !!process.env.NEXT_PHASE || process.env.BUILD_ID !== undefined;
  
  if (isProduction && !isBuildTime) {
    // In production, use a persistent path that won't be overwritten
    const persistentPath = process.env.DATABASE_PATH || '/data/ru2ya.db';
    
    // Ensure the persistent directory exists
    const persistentDir = path.dirname(persistentPath);
    if (!fs.existsSync(persistentDir)) {
      try {
        fs.mkdirSync(persistentDir, { recursive: true });
        console.log('✅ Created persistent database directory:', persistentDir);
      } catch (error) {
        console.error('❌ Failed to create persistent database directory:', error);
        // Fall back to local path if persistent creation fails
        return getLocalDatabaseConfig();
      }
    }
    
    return {
      path: persistentPath,
      backupPath: process.env.DATABASE_BACKUP_PATH || '/data/ru2ya.backup.db'
    };
  }
  
  // In development or during build, use local path
  return getLocalDatabaseConfig();
}

function getLocalDatabaseConfig(): DatabaseConfig {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  return {
    path: path.join(dataDir, 'ru2ya.db'),
    backupPath: path.join(dataDir, 'ru2ya.backup.db')
  };
}

export function backupDatabase(sourcePath: string, backupPath: string): boolean {
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, backupPath);
      console.log('✅ Database backed up to:', backupPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to backup database:', error);
    return false;
  }
}

export function restoreDatabase(backupPath: string, targetPath: string): boolean {
  try {
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, targetPath);
      console.log('✅ Database restored from backup:', backupPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to restore database:', error);
    return false;
  }
}
