import { Context } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
import { StatusCode } from "@hono/hono/utils/http-status";
import UrlService from "services/urlService.ts";

class UrlController {
  private service: UrlService;

  constructor(urlService: UrlService) {
    this.service = urlService;
  }

  static handleError(err: unknown, statusCode: StatusCode): never {
    console.error(`[Error] Status: ${statusCode}, Error:`, err);
    if (err instanceof Error) {
      throw new HTTPException(statusCode, { message: err.message });
    }
    throw new HTTPException(statusCode, { message: "Unknown error occurred" });
  }

  public create() {
    return async (c: Context) => {
      const { url, shortcode } = await c.req.json();
      if (!url) {
        throw new HTTPException(400, { message: "URL is required" });
      }
      if (shortcode) {
        try {
          const customShortUrl = this.service.customShortUrl(
            new URL(url),
            shortcode
          );
          return c.json(customShortUrl, 201);
        } catch (error) {
          UrlController.handleError(error, 400);
        }
      }
      const shortUrl = this.service.shortUrl(new URL(url));
      return c.json(shortUrl, 201);
    };
  }

  public createCustom() {
    return async (c: Context) => {
      const { url, shortcode } = await c.req.json();
      if (!shortcode && !url) {
        throw new HTTPException(400, {
          message: "URL and Shortcode are required",
        });
      }
      if (!url) {
        throw new HTTPException(400, { message: "URL is required" });
      }
      if (!shortcode) {
        throw new HTTPException(400, { message: "Shortcode is required" });
      }

      try {
        const customShortUrl = this.service.customShortUrl(
          new URL(url),
          shortcode
        );

        return c.json(customShortUrl, 201);
      } catch (error) {
        UrlController.handleError(error, 400);
      }
    };
  }

  public get() {
    return (c: Context) => {
      const shortcode = c.req.param("shortcode");
      try {
        const record = this.service.getUrlRecordSlim(shortcode);
        return c.json(record, 200);
      } catch (error) {
        UrlController.handleError(error, 404);
      }
    };
  }

  public update() {
    return async (c: Context) => {
      const { url } = await c.req.json();
      const shortcode = c.req.param("shortcode");
      if (!url) {
        throw new HTTPException(400, { message: "URL is required" });
      }
      try {
        const updatedRecord = this.service.updateShortUrl(
          shortcode,
          new URL(url)
        );
        return c.json(updatedRecord, 200);
      } catch (error) {
        UrlController.handleError(error, 404);
      }
    };
  }

  public delete() {
    return (c: Context) => {
      const shortcode = c.req.param("shortcode");
      try {
        this.service.deleteShortcode(shortcode);
        c.status(204);
        return c.body(null);
      } catch (error) {
        UrlController.handleError(error, 404);
      }
    };
  }

  public stats() {
    return (c: Context) => {
      const shortcode = c.req.param("shortcode");
      try {
        const record = this.service.getUrlRecord(shortcode);
        return c.json(record, 200);
      } catch (error) {
        UrlController.handleError(error, 404);
      }
    };
  }
}

export default UrlController;
