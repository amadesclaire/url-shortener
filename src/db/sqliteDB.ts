import { IDatabase } from "./DatabaseInterface.ts";
import { URLRecord, URLRecordSlim } from "models/urlRecordModel.ts";
import { Database } from "@db/sqlite";

class SQLiteDB implements IDatabase {
  private db: Database;

  constructor(databasePath: string) {
    this.db = new Database(databasePath);

    // Create the table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS url_records (
        shortCode TEXT PRIMARY KEY,
        id TEXT NOT NULL,
        url TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        accessCount INTEGER NOT NULL
      );
    `);
  }

  getUrlRecord(shortcode: string): URLRecord | undefined {
    const row = this.db
      .prepare(
        `
      SELECT * FROM url_records WHERE shortCode = ?
    `
      )
      .get(shortcode);

    return row as URLRecord | undefined;
  }

  setUrlRecord(shortcode: string, record: URLRecordSlim): void {
    const existingRecord = this.getUrlRecord(shortcode);
    const query = existingRecord
      ? `
        UPDATE url_records
        SET url = ?, updatedAt = ?
        WHERE shortCode = ?
      `
      : `
        INSERT INTO url_records (shortCode, id, url, createdAt, updatedAt, accessCount)
        VALUES (?, ?, ?, ?, ?, 0)
      `;

    const params = existingRecord
      ? [record.url.toString(), record.updatedAt, shortcode]
      : [
          shortcode,
          record.id,
          record.url.toString(),
          record.createdAt,
          record.updatedAt,
        ];

    this.db.prepare(query).run(...params);
  }

  deleteUrlRecord(shortcode: string): void {
    this.db
      .prepare(
        `
      DELETE FROM url_records WHERE shortCode = ?
    `
      )
      .run(shortcode);
  }

  getAllRecords(): Map<string, URLRecord> {
    const rows = this.db
      .prepare(
        `
      SELECT * FROM url_records
    `
      )
      .all();

    const records = new Map<string, URLRecord>();
    for (const row of rows) {
      records.set(row.shortCode, row as URLRecord);
    }

    return records;
  }

  incrementAccessCount(shortcode: string): void {
    const record = this.getUrlRecord(shortcode);
    if (!record) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }

    const newAccessCount = record.accessCount + 1;
    this.db
      .prepare(
        `
      UPDATE url_records
      SET accessCount = ?
      WHERE shortCode = ?
    `
      )
      .run(newAccessCount, shortcode);
  }

  close(): void {
    this.db.close();
  }
}

export default SQLiteDB;
