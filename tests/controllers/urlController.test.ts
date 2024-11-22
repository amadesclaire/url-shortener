import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";
import { Hono } from "@hono/hono";
import UrlController from "controllers/urlController.ts";
import UrlService from "services/urlService.ts";
import MemoryDB from "db/memoryDB.ts";

Deno.test("UrlController - POST /shorten - Creates a short URL", async () => {
  const db = new MemoryDB();
  const service = new UrlService(db);
  const controller = new UrlController(service);
  const app = new Hono();
  app.post("/shorten", controller.create());

  const req = new Request("http://localhost/shorten", {
    method: "POST",
    body: JSON.stringify({ url: "https://example.com" }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await app.fetch(req);
  assertEquals(res.status, 201);
  const json = await res.json();
  assertEquals(typeof json.id, "string", "id should be a string");
  assertEquals(typeof json.url, "string", "url should be a string");
  assertEquals(typeof json.shortcode, "string", "shortcode should be a string");
  assertEquals(typeof json.createdAt, "string", "createdAt should be a string");
  assertEquals(typeof json.updatedAt, "string", "updatedAt should be a string");
});

Deno.test(
  "UrlController - POST /shorten - Creates a custom shortcode",
  async () => {
    const db = new MemoryDB();
    const service = new UrlService(db);
    const controller = new UrlController(service);
    const app = new Hono();
    app.post("/shorten", controller.create());

    const req = new Request("http://localhost/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com", shortcode: "custom" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await app.fetch(req);
    assertEquals(res.status, 201);
    const json = await res.json();
    assertEquals(typeof json.id, "string", "id should be a string");
    assertEquals(typeof json.url, "string", "url should be a string");
    assertEquals(
      typeof json.shortcode,
      "string",
      "shortcode should be a string"
    );
    assertEquals(
      typeof json.createdAt,
      "string",
      "createdAt should be a string"
    );
    assertEquals(
      typeof json.updatedAt,
      "string",
      "updatedAt should be a string"
    );
    assertEquals(
      json.shortcode,
      "custom",
      `shortcode should be 'custom' is ${json.shortcode}`
    );
    assertEquals(
      json.url,
      "https://example.com/",
      `url should be 'https://example.com' is ${json.url}`
    );
  }
);

Deno.test(
  "UrlController - GET /shorten/:shortcode - Retrieves a short URL",
  async () => {
    const db = new MemoryDB();
    const service = new UrlService(db);
    const controller = new UrlController(service);
    const app = new Hono();
    app.post("/shorten", controller.create());
    app.get("/shorten/:shortcode", controller.get());

    const createReq = new Request("http://localhost/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com", shortcode: "custom" }),
      headers: { "Content-Type": "application/json" },
    });
    await app.fetch(createReq);

    const req = new Request("http://localhost/shorten/custom", {
      method: "GET",
    });

    const res = await app.fetch(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(typeof json.id, "string", "id should be a string");
    assertEquals(typeof json.url, "string", "url should be a string");
    assertEquals(
      typeof json.shortcode,
      "string",
      "shortcode should be a string"
    );
    assertEquals(
      typeof json.createdAt,
      "string",
      "createdAt should be a string"
    );
    assertEquals(
      typeof json.updatedAt,
      "string",
      "updatedAt should be a string"
    );
    assertEquals(
      json.shortcode,
      "custom",
      `shortcode should be 'custom' is ${json.shortcode}`
    );
    assertEquals(
      json.url,
      "https://example.com/",
      `url should be 'https://example.com' is ${json.url}`
    );
  }
);

Deno.test(
  "UrlController - PUT /shorten/:shortcode - Updates a short URL",
  async () => {
    const db = new MemoryDB();
    const service = new UrlService(db);
    const controller = new UrlController(service);
    const app = new Hono();
    app.post("/shorten", controller.create());
    app.put("/shorten/:shortcode", controller.update());

    const createReq = new Request("http://localhost/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com", shortcode: "custom" }),
      headers: { "Content-Type": "application/json" },
    });
    await app.fetch(createReq);

    const req = new Request("http://localhost/shorten/custom", {
      method: "PUT",
      body: JSON.stringify({ url: "https://updated.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await app.fetch(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(
      json.url,
      "https://updated.com/",
      "url should be 'https://updated.com/'"
    );
  }
);

Deno.test(
  "UrlController - DELETE /shorten/:shortcode - Deletes a shortcode",
  async () => {
    const db = new MemoryDB();
    const service = new UrlService(db);
    const controller = new UrlController(service);

    const app = new Hono();
    app.post("/shorten", controller.create());
    app.delete("/shorten/:shortcode", controller.delete());

    const createReq = new Request("http://localhost/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com", shortcode: "custom" }),
      headers: { "Content-Type": "application/json" },
    });

    await app.fetch(createReq);

    const req = new Request("http://localhost/shorten/custom", {
      method: "DELETE",
    });

    const res = await app.fetch(req);
    assertEquals(res.status, 204);
    assertEquals(await res.text(), "");
  }
);

Deno.test(
  "UrlController - GET /shorten/:shortcode/stats - Retrieves stats for a shortcode",
  async () => {
    const db = new MemoryDB();
    const service = new UrlService(db);
    const controller = new UrlController(service);

    const app = new Hono();
    app.post("/shorten", controller.create());
    app.get("/shorten/:shortcode", controller.get());
    app.get("/shorten/:shortcode/stats", controller.stats());

    const createReq = new Request("http://localhost/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com", shortcode: "custom" }),
      headers: { "Content-Type": "application/json" },
    });

    await app.fetch(createReq);

    const getReq = new Request("http://localhost/shorten/custom", {
      method: "GET",
    });

    await app.fetch(getReq);

    const req = new Request("http://localhost/shorten/custom/stats", {
      method: "GET",
    });

    const res = await app.fetch(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(
      json.accessCount,
      2,
      `accessCount should be 2 is ${json.accessCount}`
    );
  }
);
