import { assertEquals, assertThrows } from "@std/assert";
import UrlService from "services/urlService.ts";
import { URLRecord } from "models/urlRecord.ts";

Deno.test(
  "UrlService - shortUrl creates a record with a random shortcode",
  () => {
    const service = new UrlService();
    const originalUrl = new URL("https://example.com");

    const record: URLRecord = service.shortUrl(originalUrl);

    assertEquals(record.url.toString(), originalUrl.toString());
    assertEquals(record.shortCode.length, 6);
    assertEquals(record.createdAt, record.updatedAt);
  }
);

Deno.test(
  "UrlService - customShortUrl creates a record with a custom shortcode",
  () => {
    const service = new UrlService();
    const originalUrl = new URL("https://example.com");
    const shortcode = "custom";

    const record: URLRecord = service.customShortUrl(originalUrl, shortcode);

    assertEquals(record.shortCode, shortcode);
    assertEquals(record.url.toString(), originalUrl.toString());
  }
);

Deno.test(
  "UrlService - customShortUrl throws error for invalid shortcode length",
  () => {
    const service = new UrlService();
    const originalUrl = new URL("https://example.com");

    assertThrows(
      () => service.customShortUrl(originalUrl, "toolong"),
      Error,
      "Shortcode must be between 1 and 6 characters long"
    );
  }
);

Deno.test(
  "UrlService - customShortUrl throws error for duplicate shortcode",
  () => {
    const service = new UrlService();
    const originalUrl = new URL("https://example.com");
    const shortcode = "custom";

    service.customShortUrl(originalUrl, shortcode);

    assertThrows(
      () => service.customShortUrl(originalUrl, shortcode),
      Error,
      `Shortcode "${shortcode}" already exists`
    );
  }
);

Deno.test(
  "UrlService - getUrlRecord increments access count and returns URL record",
  () => {
    const service = new UrlService();
    const originalUrl = new URL("https://example.com");
    const record: URLRecord = service.shortUrl(originalUrl);

    // First access
    const fetchedRecord = service.getUrlRecord(record.shortCode);
    assertEquals(fetchedRecord.url.toString(), originalUrl.toString());

    // Verify access count
    const accessCount =
      service.getUrlRecordWithAccessCount(record.shortCode)?.accessCount ?? 0;
    assertEquals(accessCount, 1);

    // Second access
    service.getUrlRecord(record.shortCode);
    const updatedAccessCount =
      service.getUrlRecordWithAccessCount(record.shortCode)?.accessCount ?? 0;
    assertEquals(updatedAccessCount, 2);
  }
);

Deno.test(
  "UrlService - getUrlRecord throws error for nonexistent shortcode",
  () => {
    const service = new UrlService();

    assertThrows(
      () => service.getUrlRecord("nonexistent"),
      Error,
      `Shortcode "nonexistent" not found`
    );
  }
);

Deno.test("UrlService - updateShortUrl updates the URL for a shortcode", () => {
  const service = new UrlService();
  const originalUrl = new URL("https://example.com");
  const updatedUrl = new URL("https://updated.com");

  const record = service.shortUrl(originalUrl);
  const updatedRecord = service.updateShortUrl(record.shortCode, updatedUrl);

  assertEquals(updatedRecord.url.toString(), updatedUrl.toString());
  assertEquals(updatedRecord.createdAt, record.createdAt);

  // Fetch the updated record from the service
  const latestRecord = service.getUrlRecord(record.shortCode);

  // Compare the `updatedAt` timestamps
  assertEquals(
    new Date(updatedRecord.updatedAt).getTime(),
    new Date(latestRecord.updatedAt).getTime()
  );
});

Deno.test(
  "UrlService - updateShortUrl throws error for nonexistent shortcode",
  () => {
    const service = new UrlService();
    const updatedUrl = new URL("https://updated.com");

    assertThrows(
      () => service.updateShortUrl("nonexistent", updatedUrl),
      Error,
      `Shortcode "nonexistent" not found`
    );
  }
);

Deno.test("UrlService - deleteShortcode removes the record", () => {
  const service = new UrlService();
  const originalUrl = new URL("https://example.com");
  const record: URLRecord = service.shortUrl(originalUrl);

  service.deleteShortcode(record.shortCode);

  assertThrows(
    () => service.getUrlRecord(record.shortCode),
    Error,
    `Shortcode "${record.shortCode}" not found`
  );
});

Deno.test(
  "UrlService - deleteShortcode throws error for nonexistent shortcode",
  () => {
    const service = new UrlService();

    assertThrows(
      () => service.deleteShortcode("nonexistent"),
      Error,
      `Shortcode "nonexistent" not found`
    );
  }
);

Deno.test("UrlService - getAllMappings returns all stored mappings", () => {
  const service = new UrlService();
  const url1 = new URL("https://example.com/1");
  const url2 = new URL("https://example.com/2");

  const record1: URLRecord = service.shortUrl(url1);
  const record2: URLRecord = service.shortUrl(url2);

  const mappings = service.getAllMappings();

  assertEquals(mappings.size, 2);
  assertEquals(
    mappings.get(record1.shortCode)?.url.toString(),
    url1.toString()
  );
  assertEquals(
    mappings.get(record2.shortCode)?.url.toString(),
    url2.toString()
  );
});
