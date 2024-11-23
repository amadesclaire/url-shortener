import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import SQLiteDB from "db/sqliteDB.ts";
import { URLRecord, URLRecordSlim } from "models/urlRecordModel.ts";

const testDbPath = ":memory:";

Deno.test("SQLiteDB - setUrlRecord inserts a new record", () => {
  const db = new SQLiteDB(testDbPath);
  const record: URLRecordSlim = {
    id: crypto.randomUUID(),
    url: new URL("https://example.com"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcode: "abc123",
  };

  db.setUrlRecord(record.shortcode, record);
  const retrieved = db.getUrlRecord(record.shortcode);

  assertEquals(retrieved?.id, record.id, "IDs should match");
  assertEquals(retrieved?.url.toString(), record.url.href, "URLs should match");
  db.close();
});

Deno.test("SQLiteDB - setUrlRecord updates an existing record", () => {
  const db = new SQLiteDB(testDbPath);
  const initialRecord: URLRecordSlim = {
    id: crypto.randomUUID(),
    url: new URL("https://example.com"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcode: "abc123",
  };

  db.setUrlRecord(initialRecord.shortcode, initialRecord);

  const updatedRecord: URLRecordSlim = {
    ...initialRecord,
    url: new URL("https://updated-example.com"),
    updatedAt: new Date().toISOString(),
  };

  db.setUrlRecord(updatedRecord.shortcode, updatedRecord);
  const retrieved = db.getUrlRecord(updatedRecord.shortcode);

  assertEquals(
    retrieved?.url.toString(),
    updatedRecord.url.href,
    "URLs should be updated"
  );
  assertEquals(
    retrieved?.updatedAt,
    updatedRecord.updatedAt,
    "UpdatedAt should be updated"
  );
  db.close();
});

Deno.test(
  "SQLiteDB - getUrlRecord returns undefined for non-existing record",
  () => {
    const db = new SQLiteDB(testDbPath);
    const retrieved = db.getUrlRecord("nonexistent");
    assertEquals(
      retrieved,
      undefined,
      "Nonexistent shortcode should return undefined"
    );
    db.close();
  }
);

Deno.test("SQLiteDB - deleteUrlRecord removes a record", () => {
  const db = new SQLiteDB(testDbPath);
  const record: URLRecordSlim = {
    id: crypto.randomUUID(),
    url: new URL("https://example.com"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcode: "abc123",
  };

  db.setUrlRecord(record.shortcode, record);
  db.deleteUrlRecord(record.shortcode);

  const retrieved = db.getUrlRecord(record.shortcode);
  assertEquals(retrieved, undefined, "Deleted record should not exist");
  db.close();
});

Deno.test("SQLiteDB - getAllRecords retrieves all records", () => {
  const db = new SQLiteDB(testDbPath);
  const record1: URLRecordSlim = {
    id: crypto.randomUUID(),
    url: new URL("https://example1.com"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcode: "abc123",
  };

  const record2: URLRecordSlim = {
    id: crypto.randomUUID(),
    url: new URL("https://example2.com"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcode: "def456",
  };

  db.setUrlRecord(record1.shortcode, record1);
  db.setUrlRecord(record2.shortcode, record2);

  const records = db.getAllRecords();
  assertEquals(records.size, 2, "There should be 2 records");
  assertEquals(
    records.get("abc123")?.url.toString(),
    record1.url.href,
    "First record should match"
  );
  assertEquals(
    records.get("def456")?.url.toString(),
    record2.url.href,
    "Second record should match"
  );
  db.close();
});

Deno.test("SQLiteDB - incrementAccessCount increases count", () => {
  const db = new SQLiteDB(testDbPath);
  const record: URLRecord = {
    id: crypto.randomUUID(),
    url: new URL("https://example.com"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
    shortcode: "abc123",
  };

  db.setUrlRecord(record.shortcode, record);
  db.incrementAccessCount(record.shortcode);

  const retrieved = db.getUrlRecord(record.shortcode);
  assertEquals(retrieved?.accessCount, 1, "Access count should increment");
  db.close();
});

Deno.test(
  "SQLiteDB - incrementAccessCount throws for nonexistent shortcode",
  () => {
    const db = new SQLiteDB(testDbPath);
    assertThrows(
      () => db.incrementAccessCount("nonexistent"),
      Error,
      `Shortcode "nonexistent" not found`
    );
    db.close();
  }
);

Deno.test("SQLiteDB - setUrlRecord updates the updatedAt value", () => {
  const db = new SQLiteDB(":memory:");

  const record: URLRecordSlim = {
    id: crypto.randomUUID(),
    url: new URL("https://example.com"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcode: "abc123",
  };

  db.setUrlRecord(record.shortcode, record);

  const initialRecord = db.getUrlRecord(record.shortcode);
  const initialUpdatedAt = initialRecord?.updatedAt;

  const newUrl = new URL("https://updated-example.com");
  const updatedRecord: URLRecordSlim = {
    ...record,
    url: newUrl,
    updatedAt: new Date().toISOString(),
  };

  db.setUrlRecord(updatedRecord.shortcode, updatedRecord);

  const updatedRecordFromDb = db.getUrlRecord(record.shortcode);

  assertEquals(
    updatedRecordFromDb?.url.toString(),
    updatedRecord.url.href,
    "URL should be updated"
  );

  db.close();
});
