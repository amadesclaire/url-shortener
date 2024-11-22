import { URLRecord, URLRecordSlim } from "models/urlRecordModel.ts";

export interface IDatabase {
  getUrlRecord(shortcode: string): URLRecord | undefined;
  setUrlRecord(shortcode: string, record: URLRecordSlim): void;
  deleteUrlRecord(shortcode: string): void;
  getAllRecords(): Map<string, URLRecord>;
  incrementAccessCount(shortcode: string): void;
}
