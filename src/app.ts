import { Hono } from "@hono/hono";
import UrlService from "services/urlService.ts";
import MemoryDB from "db/memoryDB.ts";
import UrlController from "controllers/urlController.ts";

// Services
const db = new MemoryDB();
const urlService = new UrlService(db);
const urlController = new UrlController(urlService);

// Routes
const app = new Hono();
const api = new Hono();
const v1 = new Hono();

v1.post("/shorten", urlController.create());
v1.get("/shorten/:shortcode", urlController.get());
v1.put("/shorten/:shortcode", urlController.update());
v1.delete("/shorten/:shortcode", urlController.delete());
v1.get("/shorten/:shortcode/stats", urlController.stats());

api.route("/v1", v1);
app.route("/api", api);

Deno.serve({ port: 8000 }, app.fetch);
