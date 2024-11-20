import { assertEquals, assertThrows } from "@std/assert";
import UrlService from "services/urlService.ts";

Deno.test("UrlService - Shorten URL", () => {
  const service = new UrlService("http://short.ly");
  const originalUrl = new URL("https://example.com/long-url");

  const shortUrl = service.shortUrl(originalUrl);

  assertEquals(shortUrl.toString().startsWith("http://short.ly/"), true);
  assertEquals(
    service.getUrl(shortUrl.pathname.replace("/", "")).toString(),
    originalUrl.toString()
  );
});

Deno.test("UrlService - Custom Short URL", () => {
  const service = new UrlService("http://short.ly");
  const originalUrl = new URL("https://example.com/another-long-url");

  const customShort = service.customShortUrl(originalUrl, "custom");

  assertEquals(customShort.toString(), "http://short.ly/custom");
  assertEquals(service.getUrl("custom").toString(), originalUrl.toString());
});

Deno.test("UrlService - Custom Short URL with Duplicate Shortcode", () => {
  const service = new UrlService("http://short.ly");
  const originalUrl = new URL("https://example.com/custom");

  service.customShortUrl(originalUrl, "custom");

  assertThrows(
    () => service.customShortUrl(originalUrl, "custom"),
    Error,
    `Shortcode "custom" already exists`
  );
});

Deno.test("UrlService - Custom Short URL with Invalid Length", () => {
  const service = new UrlService("http://short.ly");
  const originalUrl = new URL("https://example.com/invalid");

  assertThrows(
    () => service.customShortUrl(originalUrl, "too-long-code"),
    Error,
    "Shortcode must be between 1 and 6 characters long"
  );
});

Deno.test("UrlService - Get URL for Non-Existent Shortcode", () => {
  const service = new UrlService("http://short.ly");

  assertThrows(
    () => service.getUrl("nonexistent"),
    Error,
    `Shortcode "nonexistent" not found`
  );
});

Deno.test("UrlService - Update Short URL", () => {
  const service = new UrlService("http://short.ly");
  const originalUrl = new URL("https://example.com/long-url");
  const updatedUrl = new URL("https://example.com/updated");

  const shortUrl = service.shortUrl(originalUrl);
  const shortcode = shortUrl.pathname.replace("/", "");

  service.updateShortUrl(shortcode, updatedUrl);

  assertEquals(service.getUrl(shortcode).toString(), updatedUrl.toString());
});

Deno.test("UrlService - Update Non-Existent Shortcode", () => {
  const service = new UrlService("http://short.ly");
  const updatedUrl = new URL("https://example.com/updated");

  assertThrows(
    () => service.updateShortUrl("nonexistent", updatedUrl),
    Error,
    `Shortcode "nonexistent" not found`
  );
});

Deno.test("UrlService - Delete Shortcode", () => {
  const service = new UrlService("http://short.ly");
  const originalUrl = new URL("https://example.com/long-url");

  const shortUrl = service.shortUrl(originalUrl);
  const shortcode = shortUrl.pathname.replace("/", "");

  service.deleteShortcode(shortcode);

  assertThrows(
    () => service.getUrl(shortcode),
    Error,
    `Shortcode "${shortcode}" not found`
  );
});

Deno.test("UrlService - Delete Non-Existent Shortcode", () => {
  const service = new UrlService("http://short.ly");

  assertThrows(
    () => service.deleteShortcode("nonexistent"),
    Error,
    `Shortcode "nonexistent" not found`
  );
});

Deno.test("UrlService - Get All Mappings", () => {
  const service = new UrlService("http://short.ly");
  const url1 = new URL("https://example.com/first");
  const url2 = new URL("https://example.com/second");

  const short1 = service.shortUrl(url1);
  const short2 = service.shortUrl(url2);

  const mappings = service.getAllMappings();

  assertEquals(mappings.size, 2);
  assertEquals(
    mappings.get(short1.pathname.replace("/", ""))?.toString(),
    url1.toString()
  );
  assertEquals(
    mappings.get(short2.pathname.replace("/", ""))?.toString(),
    url2.toString()
  );
});
