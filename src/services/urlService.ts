class UrlService {
  private baseUrl: URL;
  private urlMap: Map<string, URL> = new Map<string, URL>();

  constructor(baseUrl: string = "http://localhost:8000") {
    try {
      this.baseUrl = new URL(baseUrl);
    } catch {
      throw new Error(`Invalid base URL: ${baseUrl}`);
    }
  }

  /*
   * Generates a random 6-character shortcode.
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
   * Maps a shortcode to a URL and returns the shortened URL.
   */
  public shortUrl(url: URL): URL {
    const shortcode = this.generateShortcode();
    const shortUrl = new URL(shortcode, this.baseUrl);
    this.urlMap.set(shortcode, url);
    return shortUrl;
  }

  /*
   * Maps a custom shortcode to a URL and returns the shortened URL.
   */
  public customShortUrl(url: URL, shortcode: string): URL {
    if (shortcode.length < 1 || shortcode.length > 6) {
      throw new Error("Shortcode must be between 1 and 6 characters long");
    }

    if (this.urlMap.has(shortcode)) {
      throw new Error(`Shortcode "${shortcode}" already exists`);
    }

    const shortUrl = new URL(shortcode, this.baseUrl);
    this.urlMap.set(shortcode, url);
    return shortUrl;
  }

  /*
   * Returns the original URL for a given shortcode.
   */
  public getUrl(shortcode: string): URL {
    const url = this.urlMap.get(shortcode);
    if (!url) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }

    return url;
  }

  /*
   * Updates the URL for a given shortcode.
   */
  public updateShortUrl(shortcode: string, url: URL): void {
    if (!this.urlMap.has(shortcode)) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }

    this.urlMap.set(shortcode, url);
  }

  /*
   * Deletes a shortcode mapping.
   */
  public deleteShortcode(shortcode: string): void {
    if (!this.urlMap.has(shortcode)) {
      throw new Error(`Shortcode "${shortcode}" not found`);
    }

    this.urlMap.delete(shortcode);
  }
  /*
   * Returns all mappings.
   */
  public getAllMappings(): Map<string, URL> {
    return new Map(this.urlMap);
  }
}

export default UrlService;
