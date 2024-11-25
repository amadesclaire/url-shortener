import { Hono } from "@hono/hono";
import UrlService from "services/urlService.ts";
import MemoryDB from "db/memoryDB.ts";
import SQLiteDB from "db/sqliteDB.ts";
import UrlController from "controllers/urlController.ts";
import { home } from "views/home.tsx";
import { HTTPException } from "@hono/hono/http-exception";

// Environment Variables
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const DB_TYPE = Deno.env.get("DB_TYPE") || "sqlite";
const DB_PATH = Deno.env.get("DB_PATH") || "urls.db";

// Services
const db = DB_TYPE === "sqlite" ? new SQLiteDB(DB_PATH) : new MemoryDB();
const urlService = new UrlService(db);
const urlController = new UrlController(urlService);

// Routes
const app = new Hono();

// API
const api = new Hono();

// API v1
const v1 = new Hono();
v1.post("/shorten", urlController.create());
v1.get("/shorten/:shortcode", urlController.get());
v1.put("/shorten/:shortcode", urlController.update());
v1.delete("/shorten/:shortcode", urlController.delete());
v1.get("/shorten/:shortcode/stats", urlController.stats());

api.route("/v1", v1);
app.route("/api", api);

// UI
app.get("/", (c) => {
  return c.html(home);
});

app.post("/shorten", urlController.createWeb());

app.get("/:*", (c) => {
  const shortcode = c.req.param("*");
  console.log(shortcode);
  if (!shortcode) {
    throw new HTTPException(400, { message: "No shortcode provided" });
  }
  // Assert shortcode
  const validShortcode = /^[a-zA-Z0-9]{1,6}$/.test(shortcode);
  if (!validShortcode) {
    throw new HTTPException(400, {
      message: "Shortcode must be between 1 and 6 characters long",
    });
  }
  const record = urlService.getUrlRecordSlim(shortcode);
  return c.redirect(record ? record.url.href : "/");
});

Deno.serve({ port: PORT }, app.fetch);
