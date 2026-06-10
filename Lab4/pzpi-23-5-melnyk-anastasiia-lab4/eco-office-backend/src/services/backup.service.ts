import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';
import 'dotenv/config';

const execPromise = util.promisify(exec);

export class BackupService {
  private backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) throw new Error('DATABASE_URL is not defined');

    const command = `pg_dump "${dbUrl}" -F p -f "${filePath}"`;

    try {
      await execPromise(command);
      return { filename, path: filePath };
    } catch (error) {
      console.error('Backup failed:', error);
      throw new Error('Backup generation failed');
    }
  }

  async listBackups() {
    const files = fs.readdirSync(this.backupDir);
    return files
      .filter(f => f.endsWith('.sql'))
      .map(f => ({
        filename: f,
        createdAt: fs.statSync(path.join(this.backupDir, f)).birthtime
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async restoreBackup(filePath: string) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not defined');

    const command = `psql "${dbUrl}" < "${filePath}"`;

    try {
      await execPromise(command);
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error('Database restore failed');
    }
  }
  
  getBackupPath(filename: string) {
    const safeFilename = path.basename(filename); 
    const filePath = path.join(this.backupDir, safeFilename);
    if (!fs.existsSync(filePath)) throw new Error('File not found');
    return filePath;
  }
}