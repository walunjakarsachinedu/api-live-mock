### Api-live-mock

A dynamic express-based mock api server driven by json config. Supports nested routes, live updates without server restart.

Usage

```bash
npm install
npm run dev
```

---

<br>

Customizing api using json

- Edit `response-config.json` to define api behavior.
- Changes are applied on every request automatically (without requiring restart).

Structure of configuration in `response-config.json`

```ts
{
  "path": "/", // required, request path segment
  "method": "GET", // optional, request method, defaults to "GET"
  "status": 200, // optional, response status, defaults to 200
  "headers": {
    // optional response headers
    "X-Test": "value"
  },
  "body": {
    // optional response body
    "message": "hello"
  },
  "child": {
    // optional nested route
    "path": "sub", // relative to parent path
    "method": "POST",
    "status": 201,
    "headers": {
      "X-Sub": "yes"
    },
    "body": {
      "message": "nested response"
    }
  }
}
```

Explanation of fields

- `path`: Required request path string segment of url. Nesting forms full path (e.g. "/", then "sub" → "/sub")
- `method`: Optional request http method, defaults to "GET", should be uppercase
- `status`: Optional response status code, defaults to 200
- `headers`: Optional object of response header key-value pairs
- `body`: Optional response body, can be any valid json
- `child`: Optional single nested config node; supports further nesting, use same structure as root object

Example

```json
{
  "path": "/",
  "body": { "status": "ok" },
  "child": {
    "path": "ping",
    "method": "GET",
    "status": 200,
    "body": { "pong": true }
  }
}
```

This will return:

- GET / → `{ "status": "ok" }`
- GET /ping → `{ "pong": true }`
