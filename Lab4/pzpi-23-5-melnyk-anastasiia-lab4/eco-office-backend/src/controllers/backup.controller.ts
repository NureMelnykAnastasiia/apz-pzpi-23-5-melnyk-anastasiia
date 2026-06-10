import { Request, Response } from 'express';
import { BackupService } from '../services/backup.service';
import fs from 'fs';

export class BackupController {
  private service = new BackupService();

  list = async (req: Request, res: Response) => {
    try {
      const list = await this.service.listBackups();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const result = await this.service.createBackup();
      res.status(201).json({ 
        message: 'Backup created successfully', 
        filename: result.filename 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  download = async (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      const filePath = this.service.getBackupPath(filename);
      res.download(filePath);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  restore = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const filePath = req.file.path;
     
      await this.service.restoreBackup(filePath);
      fs.unlinkSync(filePath);

      res.json({ message: 'Database restored successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}