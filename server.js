
import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : "*"
}));

app.use(express.json({ limit: "1mb" }));

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === "false"
        ? false
        : { rejectUnauthorized: false }
    })
  : null;

// Health check
app.get("/health", async (_req, res) => {
  let database = "not_configured";

  if (pool) {
    try {
      await pool.query("SELECT 1");
      database = "ok";
    } catch {
      database = "error";
    }
  }

  res.json({
    ok: true,
    service: "NaijaNear API",
    database
  });
});

// Places / business discovery
app.get("/api/places", async (req, res, next) => {
  try {
    if (!pool) {
      return res.status(503).json({
        error: "DATABASE_URL is not configured"
      });
    }

    const q = String(req.query.q || "").trim();
    const city = String(req.query.city || "").trim();
    const type = String(req.query.type || "").trim();

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      50
    );

    const offset = Math.max(
      parseInt(req.query.offset, 10) || 0,
      0
    );

    const params = [];
    const conditions = [];

    const addParam = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (q) {
      const p = addParam(`%${q}%`);

      conditions.push(`
        (
          name ILIKE ${p}
          OR description ILIKE ${p}
          OR address ILIKE ${p}
        )
      `);
    }

    if (city) {
      conditions.push(`city ILIKE ${addParam(city)}`);
    }

    if (type) {
      conditions.push(`type = ${addParam(type)}`);
    }

    params.push(limit);
    params.push(offset);

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        type,
        city,
        state,
        address,
        rating,
        description,
        latitude,
        longitude,
        verified
      FROM places
      ${conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : ""}
      ORDER BY rating DESC NULLS LAST, name ASC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
      `,
      params
    );

    res.json({
      results: result.rows,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
});

// Central error handler
app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    error: "Internal server error"
  });
});

const port = Number(process.env.PORT) || 4000;

const server = app.listen(port, () => {
  console.log(`NaijaNear API listening on ${port}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal}: shutting down`);

  server.close(async () => {
    if (pool) {
      await pool.end();
    }

    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { app };
