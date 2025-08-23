# Database Persistence During Deployment

This guide explains how to prevent your database from being deleted during code deployments.

## The Problem

When you deploy code changes, the database file (`data/ru2ya.db`) gets deleted because:
- The entire project directory is overwritten
- Local file storage is not persistent in production environments
- Database recreation scripts might run automatically

## Solutions

### Solution 1: Use Environment Variables (Recommended)

Set these environment variables in your production environment:

```bash
# Production database path (outside project directory)
DATABASE_PATH=/data/ru2ya.db

# Backup path
DATABASE_BACKUP_PATH=/data/ru2ya.backup.db

# Environment
NODE_ENV=production
```

### Solution 2: Manual Backup Before Deployment

1. **Before deploying**, run:
   ```bash
   npm run backup-db
   ```

2. **After deploying**, run:
   ```bash
   npm run restore-db
   ```

### Solution 3: Use Persistent Volumes (Docker/Kubernetes)

If using containers, mount a persistent volume:

```yaml
volumes:
  - name: database-storage
    persistentVolumeClaim:
      claimName: ru2ya-db-pvc
      
volumeMounts:
  - name: database-storage
    mountPath: /data
```

## Deployment Workflow

### Step 1: Backup Database
```bash
npm run backup-db
```

### Step 2: Deploy Code
Deploy your application with the new code.

### Step 3: Restore Database
```bash
npm run restore-db
```

## Database Configuration

The application automatically:
- Uses persistent paths in production
- Falls back to local paths in development
- Creates backup/restore functionality
- Handles directory creation automatically

## Troubleshooting

### Database Still Gets Deleted?

1. Check if `NODE_ENV=production` is set
2. Verify `DATABASE_PATH` points to a persistent location
3. Ensure the persistent directory has write permissions
4. Check deployment logs for database errors

### Backup/Restore Not Working?

1. Verify scripts have execute permissions: `chmod +x scripts/*.js`
2. Check if `data/` directory exists
3. Ensure sufficient disk space for backups
4. Check file permissions on backup/restore paths

## Best Practices

1. **Always backup before deployment**
2. **Use persistent storage in production**
3. **Test backup/restore in staging first**
4. **Monitor database file sizes**
5. **Keep multiple backup versions**

## File Locations

- **Database**: `data/ru2ya.db`
- **Backup**: `data/ru2ya.backup.db`
- **Scripts**: `scripts/deploy-backup.js`, `scripts/restore-db.js`
- **Config**: `lib/db-config.ts`
