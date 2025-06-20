import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const port: number = 3000;
const configPath = path.join(__dirname, "../response-config.json");

app.use(cors());
app.use(express.json());

type ConfigNode = {
  path: string;
  method?: string;
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  child?: ConfigNode;
};

const loadConfig = (): ConfigNode | null => {
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as ConfigNode;
  } catch {
    return null;
  }
};

// recursively walk config tree matching request path
const findMatchingNode = (
  node: ConfigNode,
  segments: string[],
  method: string
): ConfigNode | null => {
  if (segments.length === 0) {
    const isMethodMatch = (node.method ?? "GET").toUpperCase() === method;
    return isMethodMatch ? node : null;
  }

  if (!node.child) return null;
  const [nextSegment, ...rest] = segments;
  if (node.child.path === nextSegment) {
    return findMatchingNode(node.child, rest, method);
  }

  return null;
};

// dynamic middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const config = loadConfig();
  if (!config) return next();

  const segments = req.path.split("/").filter(Boolean); // e.g., "/a/b" => ["a", "b"]
  const method = req.method.toUpperCase();

  const matched = findMatchingNode(config, segments, method);
  if (!matched) return next();

  const status = matched.status ?? 200;
  const headers = matched.headers ?? {};
  const body = matched.body ?? {};

  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(status).send(body);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
