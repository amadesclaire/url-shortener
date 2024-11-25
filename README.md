# URL Shortener

A lightweight and extensible URL shortener service built with [Deno](https://deno.land/) and SQLite. This project provides a simple API to create, manage, and retrieve shortened URLs, with support for configurable storage and runtime settings.

---

## Features

- **Shorten URLs**: Generate shortcodes for URLs with optional custom codes.
- **URL Redirection**: Redirect users from shortcodes to the original URLs.
- **Statistics**: Track access counts and timestamps for each shortcode.
- **Configurable Storage**: Use SQLite for persistence or an in-memory database.
- **Customizable Port**: Specify the port the server listens on.
- **Hot Reload**: Automatically restarts the server on file changes with `deno run --watch`.

---

## Getting Started

### Prerequisites

- Install [Deno](https://deno.land/) (v1.34+ recommended)

---

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:
   - Deno will fetch them automatically when you run the project.

---

### Running the Project

Start the server using `deno task run`:

```bash
deno task run
```

This will:

- Start the server on the default port `8000`.
- Use SQLite (`urls.db`) for persistence by default.

---

## Configuration

You can configure the following options using environment variables:

| Variable  | Default   | Description                                                 |
| --------- | --------- | ----------------------------------------------------------- |
| `PORT`    | `8000`    | The port the server listens on.                             |
| `DB_TYPE` | `sqlite`  | The database type (`sqlite` or `memory`).                   |
| `DB_PATH` | `urls.db` | The SQLite database file path. Ignored if `DB_TYPE=memory`. |

### Example Usage

Run the server with custom configurations:

```bash
PORT=3000 DB_TYPE=sqlite DB_PATH=my_urls.db deno task run
```

- `PORT=3000`: The server listens on port 3000.
- `DB_TYPE=sqlite`: Uses SQLite for storage.
- `DB_PATH=my_urls.db`: SQLite will use `my_urls.db` as the database file.

To use an in-memory database (non-persistent):

```bash
DB_TYPE=memory deno task run
```

---

## API Endpoints

### Create a Short URL

**POST** `/shorten`

- **Body**:

  ```json
  {
    "url": "https://example.com",
    "shortcode": "optionalCustomCode"
  }
  ```

- **Response**:
  ```json
  {
    "id": "unique-id",
    "url": "https://example.com",
    "shortcode": "generatedOrCustomCode",
    "createdAt": "2024-11-23T15:08:33.589Z",
    "updatedAt": "2024-11-23T15:08:33.589Z"
  }
  ```

---

### Retrieve a Short URL

**GET** `/:shortcode`

- Redirects to the original URL.

---

### Get Shortcode Stats

**GET** `/shorten/:shortcode/stats`

- **Response**:
  ```json
  {
    "id": "unique-id",
    "url": "https://example.com",
    "shortcode": "generatedOrCustomCode",
    "accessCount": 10,
    "createdAt": "2024-11-23T15:08:33.589Z",
    "updatedAt": "2024-11-23T15:08:33.589Z"
  }
  ```

---

### Update a Short URL

**PUT** `/shorten/:shortcode`

- **Body**:

  ```json
  {
    "url": "https://new-example.com"
  }
  ```

- **Response**:
  ```json
  {
    "id": "unique-id",
    "url": "https://new-example.com",
    "shortcode": "generatedOrCustomCode",
    "createdAt": "2024-11-23T15:08:33.589Z",
    "updatedAt": "2024-11-23T16:08:33.589Z"
  }
  ```

---

### Delete a Short URL

**DELETE** `/shorten/:shortcode`

- **Response**:
  - HTTP 204 No Content

---

## Development

### Running Tests

To run tests, use the following command:

```bash
deno test --allow-net --allow-read --allow-write --allow-env
```

---

### Project Structure

```
src/
  app.ts         # Main server entry point
  controllers/   # Controllers for handling API requests
  db/            # Database adapters (e.g., SQLiteDB, MemoryDB)
  models/        # TypeScript models for URLRecord and URLRecordSlim
  services/      # Business logic services (UrlService)
  tests/         # Unit tests
```

---

## License

This project is licensed under the MIT License. See `LICENSE` for more details.

---

https://roadmap.sh/projects/url-shortening-service
