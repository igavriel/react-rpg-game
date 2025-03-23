///////////////////////////////////////////////////////////////////////////////
// BaseModel is an abstract class that provides a base implementation for a model
///////////////////////////////////////////////////////////////////////////////
import fs from "fs";
import path from "path";
import { ColorLogger as Logger } from "../../utilities/colorLogger";

export abstract class BaseFileModel<T> {
  protected readonly storageFile: string;

  constructor(storageFile: string) {
    Logger.debug(`Storage file: ${storageFile}`);
    this.storageFile = storageFile;
  }

  // Async save items to the storage file using synchronous operations
  async save(items: T[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Logger.debug(`[Save] Starting save method for ${this.storageFile}, Current working directory: ${process.cwd()}, Absolute path of storage file: ${path.resolve(this.storageFile)}`);

      const data = JSON.stringify(items, null, 2); // Pretty print JSON
      Logger.debug(`[Save] Data size: ${data.length}`);
      const dir = path.dirname(this.storageFile);

      // Synchronous operations
      try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          Logger.debug(`[Save] Created directory: ${dir}`);
        }

        // Write file synchronously
        fs.writeFileSync(this.storageFile, data, "utf-8");
        Logger.debug(`[Save] Saved file: ${this.storageFile}`);

        resolve();
      } catch (error) {
        const strErr = `Failed to save data: ${error}`;
        Logger.error(strErr);
        reject(new Error(strErr));
      }
    });
  }

  // Async load items from the storage file using synchronous operations
  async load(): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      Logger.debug(`[Load] Starting load method for ${this.storageFile}, Current working directory: ${process.cwd()}, Absolute path of storage file: ${path.resolve(this.storageFile)}`);

      try {
        // Verify file existence and get stats synchronously
        if (!fs.existsSync(this.storageFile)) {
          Logger.warn('[Load] File not found');
          resolve([]);
          return;
        }

        const stats = fs.statSync(this.storageFile);
        if (stats.size === 0) {
          Logger.warn('[Load] Empty file detected');
          resolve([]);
          return;
        }

        // Read file synchronously
        const data = fs.readFileSync(this.storageFile, { encoding: 'utf-8' });
        Logger.debug(`[Load] Read ${data.length} characters`);

        const parsedData = JSON.parse(data) as T[];
        Logger.debug(`[Load] JSON parsed successfully. Number of items: ${parsedData.length}`);

        resolve(parsedData);
      } catch (error) {
        const strErr = `Failed to load data: ${error}`;
        Logger.error(strErr);
        reject(new Error(strErr));
      }
    });
  }
}
