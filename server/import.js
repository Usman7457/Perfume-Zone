// Usage: node import.js products.csv
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('Please specify a CSV file: node import.js <filename.csv>');
  process.exit(1);
}

if (!fs.existsSync(fileArg)) {
  console.error(`File not found: ${fileArg}`);
  process.exit(1);
}

const useSsl = process.env.DB_SSL === 'true';
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: useSsl ? { rejectUnauthorized: false } : false }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME || 'perfumezone',
        ssl: useSsl ? { rejectUnauthorized: false } : false
      }
);

const slugify = (text = '') =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const rows = parse(fs.readFileSync(fileArg), { columns: true, skip_empty_lines: true });

const client = await pool.connect();
try {
  await client.query('BEGIN');

  for (const r of rows) {
    const cleanHandle = r.handle || slugify(r.title);
    const collectionsText = r.collections || 'new-in';
    const price = parseFloat(String(r.price || '0').replace(/[^0-9.]/g, '')) || 0;
    const compareAtPrice = r.compare_at_price
      ? parseFloat(String(r.compare_at_price).replace(/[^0-9.]/g, '')) || null
      : null;

    const res = await client.query(
      `INSERT INTO products (
         handle, title, brand, price, compare_at_price,
         image_url, image_url_2, description, size, collections
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (handle) DO UPDATE SET
         title = EXCLUDED.title,
         brand = EXCLUDED.brand,
         price = EXCLUDED.price,
         compare_at_price = EXCLUDED.compare_at_price,
         image_url = EXCLUDED.image_url,
         image_url_2 = EXCLUDED.image_url_2,
         description = EXCLUDED.description,
         size = EXCLUDED.size,
         collections = EXCLUDED.collections
       RETURNING id`,
      [
        cleanHandle,
        r.title,
        r.brand || 'Perfume Zone',
        price,
        compareAtPrice,
        r.image_url || '',
        r.image_url_2 || '',
        r.description || '',
        r.size || '100ml Eau De Parfum',
        collectionsText
      ]
    );

    const productId = res.rows[0].id;
    for (const h of String(collectionsText).split('|').filter(Boolean)) {
      const colHandle = slugify(h);
      if (!colHandle) continue;
      await client.query(
        'INSERT INTO collections (handle, title) VALUES ($1, $2) ON CONFLICT (handle) DO NOTHING',
        [colHandle, h.trim()]
      );
      await client.query(
        `INSERT INTO product_collections (product_id, collection_id)
         SELECT $1, id FROM collections WHERE handle = $2
         ON CONFLICT DO NOTHING`,
        [productId, colHandle]
      );
    }
  }

  await client.query('COMMIT');
  console.log('Imported', rows.length, 'products into Perfume Zone PostgreSQL database.');
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('CSV import failed:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
