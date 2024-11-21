import { URLRecord, URLRecordSlim } from "models/urlRecordModel.ts";
import { IDatabase } from "./DatabaseInterface.ts";

class MemoryDB implements IDatabase {
  private urlMap = new Map<string, URLRecord>();

  getUrlRecord(shortcode: string): URLRecord | undefined {
    return this.urlMap.get(shortcode);
  }

  getUrlRecordSlim(shortcode: string): URLRecordSlim | undefined {
    const { accessCount: _, ...slim } = this.urlMap.get(shortcode) as URLRecord;
    return slim;
  }

  setUrlRecord(shortcode: string, record: URLRecord): void {
    this.urlMap.set(shortcode, record);
  }

  deleteUrlRecord(shortcode: string): void {
    this.urlMap.delete(shortcode);
  }

  getAllRecords(): Map<string, URLRecord> {
    return new Map(this.urlMap);
  }
}

export default MemoryDB;
