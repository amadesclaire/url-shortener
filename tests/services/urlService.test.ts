import { assertEquals, assertThrows } from "@std/assert";
import { URLRecord } from "models/urlRecordModel.ts";
import MemoryDB from "db/MemoryDB.ts";
import UrlService from "services/urlService.ts";

Deno.test("UrlService - Shorten URL", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const url = new URL("https://example.com");
  const slimRecord = service.shortUrl(url);

  assertEquals(
    slimRecord.url.href,
    url.href,
    "Shortened URL should match the input URL"
  );
  assertEquals(
    slimRecord.shortCode.length,
    6,
    "Shortcode should be 6 characters long"
  );
  assertEquals(
    typeof slimRecord.createdAt,
    "string",
    "CreatedAt should be a string"
  );
});

Deno.test("UrlService - Custom Short URL", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const url = new URL("https://example.com");
  const shortcode = "custom";

  const slimRecord = service.customShortUrl(url, shortcode);

  assertEquals(
    slimRecord.shortCode,
    shortcode,
    "Shortcode should match the custom value"
  );
  assertEquals(slimRecord.url.href, url.href, "URL should match the input URL");
});

Deno.test("UrlService - Custom Short URL Validation", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const url = new URL("https://example.com");

  assertThrows(
    () => service.customShortUrl(url, "too-long-shortcode"),
    Error,
    "Shortcode must be between 1 and 6 characters long",
    "Should throw an error for shortcodes longer than 6 characters"
  );

  assertThrows(
    () => service.customShortUrl(url, "inv@lid"),
    Error,
    "Shortcode must be between 1 and 6 characters long",
    "Should throw an error for invalid shortcodes"
  );
});

Deno.test("UrlService - Get URL Record Slim", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record = service.shortUrl(new URL("https://example.com"));
  const shortcode = record.shortCode;

  const slimRecord = service.getUrlRecordSlim(shortcode);
  assertEquals(slimRecord.shortCode, shortcode, "Shortcode should match");
  assertEquals(slimRecord.url.href, record.url.href, "URL should match");
  assertEquals(
    service.getUrlRecord(shortcode).accessCount,
    2,
    "Access count should be incremented"
  );
});

Deno.test("UrlService - Get URL Record", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record = service.shortUrl(new URL("https://example.com"));
  const fullRecord = service.getUrlRecord(record.shortCode);

  assertEquals(
    fullRecord.shortCode,
    record.shortCode,
    "Shortcode should match"
  );
  assertEquals(fullRecord.url.href, record.url.href, "URL should match");
  assertEquals(fullRecord.accessCount, 1, "Access count should be incremented");
});

Deno.test("UrlService - Update Short URL", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record = structuredClone(
    service.shortUrl(new URL("https://example.com"))
  );

  const newUrl = new URL("https://new-example.com");
  const updatedRecord = service.updateShortUrl(record.shortCode, newUrl);

  assertEquals(updatedRecord.url.href, newUrl.href, "URL should be updated");
  assertEquals(
    updatedRecord.shortCode,
    record.shortCode,
    "Shortcode should remain the same"
  );
  assertEquals(
    record.updatedAt === updatedRecord.updatedAt,
    true,
    "UpdatedAt should change"
  );
});

Deno.test("UrlService - Delete Shortcode", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record: URLRecord = {
    id: "1",
    url: new URL("https://example.com"),
    shortCode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortCode, record);

  service.deleteShortcode(record.shortCode);

  const result = db.getUrlRecord(record.shortCode);
  assertEquals(result, undefined, "Record should be deleted");
});

Deno.test("UrlService - Get All Mappings", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record1: URLRecord = {
    id: "1",
    url: new URL("https://example1.com"),
    shortCode: "short1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  const record2: URLRecord = {
    id: "2",
    url: new URL("https://example2.com"),
    shortCode: "short2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record1.shortCode, record1);
  db.setUrlRecord(record2.shortCode, record2);

  const allMappings = service.getAllMappings();
  assertEquals(allMappings.size, 2, "Should retrieve all mappings");
});
