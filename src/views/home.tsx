export const home = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shorten URL</title>
      </head>
      <body>
        <h1>Shorten Your URL</h1>
        <form action="/shorten" method="post">
          <label for="url">URL:</label>
          <input type="url" id="url" name="url" placeholder="Enter your URL" required>
          <br><br>
          <label for="shortcode">Shortcode (optional):</label>
          <input type="text" id="shortcode" name="shortcode" placeholder="Enter a shortcode">
          <br><br>
          <button type="submit">Shorten</button>
        </form>
      </body>
      </html>`;
