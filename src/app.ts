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

app.post("/shorten", urlController.create());
app.get("/shorten/:shortcode", urlController.get());
app.put("/shorten/:shortcode", urlController.update());
app.delete("/shorten/:shortcode", urlController.delete());
app.get("/shorten/:shortcode/stats", urlController.stats());

api.route("/v1", v1);
app.route("/api", api);
export default app;
