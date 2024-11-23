import { assertEquals, assertThrows } from "@std/assert";
import { URLRecord } from "models/urlRecordModel.ts";
import MemoryDB from "db/memoryDB.ts";
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
    slimRecord.shortcode.length,
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
    slimRecord.shortcode,
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
  const shortcode = record.shortcode;

  const slimRecord = service.getUrlRecordSlim(shortcode);
  assertEquals(slimRecord.shortcode, shortcode, "Shortcode should match");
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
  const fullRecord = service.getUrlRecord(record.shortcode);

  assertEquals(
    fullRecord.shortcode,
    record.shortcode,
    "Shortcode should match"
  );
  assertEquals(fullRecord.url.href, record.url.href, "URL should match");
  assertEquals(fullRecord.accessCount, 1, "Access count should be incremented");
});

Deno.test("UrlService - Update Short URL", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record = service.shortUrl(new URL("https://example.com"));
  const recordClone = {
    ...record,
  };

  const newUrl = new URL("https://new-example.com");
  const updatedRecord = service.updateShortUrl(record.shortcode, newUrl);

  assertEquals(updatedRecord.url.href, newUrl.href, "URL should be updated");
  assertEquals(
    updatedRecord.shortcode,
    recordClone.shortcode,
    "Shortcode should remain the same"
  );
});

Deno.test("UrlService - Delete Shortcode", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record: URLRecord = {
    id: "1",
    url: new URL("https://example.com"),
    shortcode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortcode, record);

  service.deleteShortcode(record.shortcode);

  const result = db.getUrlRecord(record.shortcode);
  assertEquals(result, undefined, "Record should be deleted");
});

Deno.test("UrlService - Get All Mappings", () => {
  const db = new MemoryDB();
  const service = new UrlService(db);

  const record1: URLRecord = {
    id: "1",
    url: new URL("https://example1.com"),
    shortcode: "short1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  const record2: URLRecord = {
    id: "2",
    url: new URL("https://example2.com"),
    shortcode: "short2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record1.shortcode, record1);
  db.setUrlRecord(record2.shortcode, record2);

  const allMappings = service.getAllMappings();
  assertEquals(allMappings.size, 2, "Should retrieve all mappings");
});
