import { assertEquals, assertThrows } from "@std/assert";
import MemoryDB from "db/memoryDB.ts";
import { URLRecord } from "models/urlRecordModel.ts";

Deno.test("MemoryDB - Set and Get URL Record", () => {
  const db = new MemoryDB();
  const record: URLRecord = {
    id: "1",
    url: new URL("https://example.com"),
    shortcode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortcode, record);
  const retrieved = db.getUrlRecord(record.shortcode);

  assertEquals(
    retrieved,
    record,
    "Retrieved record should match the inserted record"
  );
});

Deno.test("MemoryDB - Get URL Record Not Found", () => {
  const db = new MemoryDB();

  const result = db.getUrlRecord("nonexistent");
  assertEquals(
    result,
    undefined,
    "Should return undefined for nonexistent records"
  );
});

Deno.test("MemoryDB - Delete URL Record", () => {
  const db = new MemoryDB();
  const record: URLRecord = {
    id: "1",
    url: new URL("https://example.com"),
    shortcode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortcode, record);
  db.deleteUrlRecord(record.shortcode);

  const result = db.getUrlRecord(record.shortcode);
  assertEquals(
    result,
    undefined,
    "Record should be deleted and return undefined"
  );
});

Deno.test("MemoryDB - Get All Records", () => {
  const db = new MemoryDB();
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

  const allRecords = db.getAllRecords();
  assertEquals(allRecords.size, 2, "Should contain all inserted records");
  assertEquals(
    allRecords.get(record1.shortcode),
    record1,
    "Should retrieve first record correctly"
  );
  assertEquals(
    allRecords.get(record2.shortcode),
    record2,
    "Should retrieve second record correctly"
  );
});

Deno.test("MemoryDB - Increment Access Count", () => {
  const db = new MemoryDB();
  const record: URLRecord = {
    id: "1",
    url: new URL("https://example.com"),
    shortcode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortcode, record);
  db.incrementAccessCount(record.shortcode);
  db.incrementAccessCount(record.shortcode);

  const updatedRecord = db.getUrlRecord(record.shortcode);
  assertEquals(
    updatedRecord?.accessCount,
    2,
    "Access count should be incremented twice"
  );
});

Deno.test("MemoryDB - Increment Access Count for Nonexistent Record", () => {
  const db = new MemoryDB();

  assertThrows(
    () => db.incrementAccessCount("nonexistent"),
    Error,
    'Shortcode "nonexistent" not found.',
    "Should throw an error for nonexistent records"
  );
});
