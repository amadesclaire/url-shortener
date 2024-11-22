import { assertEquals, assertThrows } from "@std/assert";
import MemoryDB from "db/MemoryDB.ts";
import { URLRecord } from "models/urlRecordModel.ts";

Deno.test("MemoryDB - Set and Get URL Record", () => {
  const db = new MemoryDB();
  const record: URLRecord = {
    id: "1",
    url: new URL("https://example.com"),
    shortCode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortCode, record);
  const retrieved = db.getUrlRecord(record.shortCode);

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
    shortCode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortCode, record);
  db.deleteUrlRecord(record.shortCode);

  const result = db.getUrlRecord(record.shortCode);
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

  const allRecords = db.getAllRecords();
  assertEquals(allRecords.size, 2, "Should contain all inserted records");
  assertEquals(
    allRecords.get(record1.shortCode),
    record1,
    "Should retrieve first record correctly"
  );
  assertEquals(
    allRecords.get(record2.shortCode),
    record2,
    "Should retrieve second record correctly"
  );
});

Deno.test("MemoryDB - Increment Access Count", () => {
  const db = new MemoryDB();
  const record: URLRecord = {
    id: "1",
    url: new URL("https://example.com"),
    shortCode: "abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  db.setUrlRecord(record.shortCode, record);
  db.incrementAccessCount(record.shortCode);
  db.incrementAccessCount(record.shortCode);

  const updatedRecord = db.getUrlRecord(record.shortCode);
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
