import { URLRecord } from "../models/urlRecord.ts";

class UrlService {
  private urlMap: Map<string, URLRecord> = new Map<string, URLRecord>();
  private accessCountMap: Map<string, number> = new Map<string, number>();

  /*
   * Generates a random shortcode of 6 characters
   */
  private generateShortcode(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shortcode: string;

    do {
      shortcode = Array.from({ length: 6 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join("");
    } while (this.urlMap.has(shortcode));

    return shortcode;
  }

  /*
   * Creates a URL record with a random shortcode
   */
  public shortUrl(url: URL): URLRecord {
    const shortcode = this.generateShortcode();
    const createdAt = new Date().toISOString();
    const urlRecord: URLRecord = {
      id: crypto.randomUUID(),
      url: url,
      shortCode: shortcode,
      createdAt: createdAt,
      updatedAt: createdAt,
    };
    this.accessCountMap.set(shortcode, 0);
    this.urlMap.set(shortcode, urlRecord);
    return urlRecord;
  }

  /*
   * Creates a URL record with a custom shortcode
   */
  public customShortUrl(url: URL, shortcode: string): URLRecord {
    if (shortcode.length < 1 || shortcode.length > 6) {
      throw new Error("Shortcode must be between 1 and 6 characters long");
    }

    if (this.urlMap.has(shortcode)) {
      throw new Error(`Shortcode "${shortcode}" already exists`);
    }

    const urlRecord: URLRecord = {
      id: crypto.randomUUID(),
      url: url,
      shortCode: shortcode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.urlMap.set(shortcode, urlRecord);
    this.accessCountMap.set(shortcode, 0);
    return urlRecord;
  }

  /*
   * Returns the URL record for a given shortcode
   */
  public getUrlRecord(shortcode: string): URLRecord {
    const urlRecord = this.urlMap.get(shortcode);
    if (!urlRecord) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }
    const accessCount = this.accessCountMap.get(shortcode) ?? 0;
    this.accessCountMap.set(shortcode, accessCount + 1);
    return urlRecord;
  }

  public getUrlRecordWithAccessCount(shortcode: string): URLRecord {
    const urlRecord = this.urlMap.get(shortcode);
    if (!urlRecord) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }
    const accessCount = this.accessCountMap.get(shortcode) ?? 0;
    return {
      ...urlRecord,
      accessCount,
    };
  }

  /*
   * Updates the URL record for a given shortcode
   */
  public updateShortUrl(shortcode: string, url: URL): URLRecord {
    const urlRecord = this.urlMap.get(shortcode);
    if (!urlRecord) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }
    const updatedAt = new Date().toISOString();
    const newUrlRecord = {
      ...urlRecord,
      url: url,
      updatedAt: updatedAt,
    };

    this.urlMap.set(shortcode, newUrlRecord);
    return newUrlRecord;
  }

  /*
   * Deletes the URL record for a given shortcode
   */
  public deleteShortcode(shortcode: string): void {
    if (!this.urlMap.has(shortcode)) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }
    if (this.accessCountMap.has(shortcode)) {
      this.accessCountMap.delete(shortcode);
    }
    this.urlMap.delete(shortcode);
  }

  public getAllMappings(): Map<string, URLRecord> {
    return new Map(this.urlMap);
  }
}

export default UrlService;
