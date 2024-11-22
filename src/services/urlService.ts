import { IDatabase } from "db/DatabaseInterface.ts";
import { URLRecord, URLRecordSlim } from "models/urlRecordModel.ts";

class UrlService {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  private assertRecordExists(
    record: URLRecord | URLRecordSlim | undefined,
    shortcode: string
  ): asserts record is URLRecord | URLRecordSlim {
    if (!record) throw new Error(`Shortcode "${shortcode}" not found`);
  }

  private toSlim(record: URLRecord): URLRecordSlim {
    const { accessCount: _, ...slim } = record;
    return slim;
  }

  private generateShortcode(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shortcode: string;

    do {
      shortcode = Array.from({ length: 6 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join("");
    } while (this.db.getUrlRecord(shortcode));

    return shortcode;
  }

  public shortUrl(url: URL): URLRecordSlim {
    const shortcode = this.generateShortcode();
    const createdAt = new Date().toISOString();
    const urlRecord: URLRecord = {
      id: crypto.randomUUID(),
      url: url,
      shortCode: shortcode,
      createdAt,
      updatedAt: createdAt,
      accessCount: 0,
    };
    this.db.setUrlRecord(shortcode, urlRecord);
    return this.toSlim(urlRecord);
  }

  public customShortUrl(url: URL, shortcode: string): URLRecordSlim {
    if (!/^[a-zA-Z0-9]{1,6}$/.test(shortcode)) {
      throw new Error("Shortcode must be between 1 and 6 characters long");
    }

    if (this.db.getUrlRecord(shortcode)) {
      throw new Error(`Shortcode "${shortcode}" already exists`);
    }

    const urlRecord: URLRecord = {
      id: crypto.randomUUID(),
      url: url,
      shortCode: shortcode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: 0,
    };

    this.db.setUrlRecord(shortcode, urlRecord);
    return this.toSlim(urlRecord);
  }

  public getUrlRecordSlim(shortcode: string): URLRecordSlim {
    const urlRecord = this.db.getUrlRecord(shortcode);
    this.assertRecordExists(urlRecord, shortcode);
    this.db.incrementAccessCount(shortcode);
    urlRecord.accessCount++;
    return this.toSlim(urlRecord);
  }

  public getUrlRecord(shortcode: string): URLRecord {
    const urlRecord = this.db.getUrlRecord(shortcode);
    this.assertRecordExists(urlRecord, shortcode);
    this.db.incrementAccessCount(shortcode);
    urlRecord.accessCount++;
    return urlRecord;
  }

  public updateShortUrl(shortcode: string, url: URL): URLRecordSlim {
    const urlRecord = this.db.getUrlRecord(shortcode);
    this.assertRecordExists(urlRecord, shortcode);
    const updatedAt = new Date().toISOString();
    const updatedRecord: URLRecord = {
      ...urlRecord,
      url,
      updatedAt,
    };

    this.db.setUrlRecord(shortcode, updatedRecord);
    return this.toSlim(updatedRecord);
  }

  public deleteShortcode(shortcode: string): void {
    const urlRecord = this.db.getUrlRecord(shortcode);
    this.assertRecordExists(urlRecord, shortcode);

    this.db.deleteUrlRecord(shortcode);
  }

  public getAllMappings(): Map<string, URLRecordSlim> {
    return this.db.getAllRecords();
  }
}

export default UrlService;
