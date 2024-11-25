import { Context } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
import UrlService from "services/urlService.ts";

class UrlController {
  private service: UrlService;

  constructor(urlService: UrlService) {
    this.service = urlService;
  }

  private static wrapHandler(
    handler: (c: Context) => Promise<Response> | Response
  ) {
    return async (c: Context) => {
      try {
        return await handler(c);
      } catch (error) {
        UrlController.handleError(error);
      }
    };
  }

  private static handleError(err: unknown): never {
    console.error(`[Error]:`, err);
    if (err instanceof Error) {
      switch (err.message) {
        case "Shortcode must be between 1 and 6 characters long":
        case "Shortcode already exists":
        case "URL is required":
          throw new HTTPException(400, { message: err.message });
        default:
          throw new HTTPException(500, { message: "Internal server error" });
      }
    }
    throw new HTTPException(500, { message: "Unknown error occurred" });
  }

  public create() {
    return UrlController.wrapHandler(async (c: Context) => {
      const { url, shortcode } = await c.req.json();

      if (!url) throw new Error("URL is required");

      const shortUrl = shortcode
        ? this.service.customShortUrl(new URL(url), shortcode)
        : this.service.shortUrl(new URL(url));

      return c.json(shortUrl, 201);
    });
  }

  public createCustom() {
    return UrlController.wrapHandler(async (c: Context) => {
      const { url, shortcode } = await c.req.json();

      if (!shortcode) throw new Error("Shortcode is required");
      if (!url) throw new Error("URL is required");

      const customShortUrl = this.service.customShortUrl(
        new URL(url),
        shortcode
      );
      return c.json(customShortUrl, 201);
    });
  }

  public get() {
    return UrlController.wrapHandler((c: Context) => {
      const shortcode = c.req.param("shortcode");
      const record = this.service.getUrlRecordSlim(shortcode);
      return c.json(record, 200);
    });
  }

  public update() {
    return UrlController.wrapHandler(async (c: Context) => {
      const { url } = await c.req.json();
      const shortcode = c.req.param("shortcode");

      if (!url) throw new Error("URL is required");

      const updatedRecord = this.service.updateShortUrl(
        shortcode,
        new URL(url)
      );
      return c.json(updatedRecord, 200);
    });
  }

  public delete() {
    return UrlController.wrapHandler((c: Context) => {
      const shortcode = c.req.param("shortcode");
      this.service.deleteShortcode(shortcode);
      c.status(204);
      return c.body(null);
    });
  }

  public stats() {
    return UrlController.wrapHandler((c: Context) => {
      const shortcode = c.req.param("shortcode");
      const record = this.service.getUrlRecord(shortcode);
      return c.json(record, 200);
    });
  }

  public createWeb() {
    return UrlController.wrapHandler(async (c: Context) => {
      const body = await c.req.parseBody();
      const { url, shortcode } = body;

      if (!url || typeof url !== "string")
        throw new Error("URL must be a string");
      if (shortcode && typeof shortcode !== "string")
        throw new Error("Shortcode must be a string");

      const urlRecordSlim = shortcode
        ? this.service.customShortUrl(new URL(url), shortcode)
        : this.service.shortUrl(new URL(url));

      const {
        id,
        url: slimUrl,
        shortcode: slimShortcode,
        createdAt,
        updatedAt,
      } = urlRecordSlim;

      return c.html(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>URL Record</title>
        </head>
        <body>
          <h1>URL Record</h1>
          <p><strong>ID:</strong> ${id}</p>
          <p><strong>URL:</strong> ${slimUrl}</p>
          <p><strong>Shortcode:</strong> ${slimShortcode}</p>
          <p><strong>Created At:</strong> ${createdAt}</p>
          <p><strong>Updated At:</strong> ${updatedAt}</p>
        </body>
        </html>
      `);
    });
  }
}

export default UrlController;
