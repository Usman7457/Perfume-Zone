// Usage: node import-excel.js products.xlsx (or products.csv)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';
import * as XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('Please specify an excel or csv file: node import-excel.js <filename>');
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
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function run() {
  console.log(`Reading ${fileArg}...`);
  const workbook = XLSX.readFile(fileArg);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  console.log(`Found ${rows.length} rows. Importing to Perfume Zone PostgreSQL database...`);

  const client = await pool.connect();
  let imported = 0;

  try {
    await client.query('BEGIN');

    for (const r of rows) {
      const keys = Object.keys(r);
      const getVal = (...fieldNames) => {
        const found = keys.find((k) =>
          fieldNames.some((fn) => k.toLowerCase().replace(/[\s_-]/g, '') === fn.toLowerCase().replace(/[\s_-]/g, ''))
        );
        return found ? r[found] : '';
      };

      const title = getVal('title', 'name', 'producttitle', 'productname') || 'Fragrance';
      let handle = getVal('handle', 'slug', 'sku');
      if (!handle) handle = slugify(title);

      const brand = getVal('brand', 'vendor', 'designer') || 'Perfume Zone';
      const priceRaw = getVal('price', 'cost', 'unitprice') || 0;
      const price = parseFloat(String(priceRaw).replace(/[^0-9.]/g, '')) || 0;

      const compareRaw = getVal('compare_at_price', 'regularprice', 'retailprice', 'msrp');
      const compare_at_price = compareRaw ? parseFloat(String(compareRaw).replace(/[^0-9.]/g, '')) : null;

      const image_url = getVal('image_url', 'image', 'imageurl', 'img');
      const image_url_2 = getVal('image_url_2', 'image2', 'altimage');
      const description = getVal('description', 'desc', 'details') || '';
      const size = getVal('size', 'volume', 'variant') || '100ml Eau De Parfum';
      const collections = getVal('collections', 'category', 'tags') || '';

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
        [handle, title, brand, price, compare_at_price, image_url, image_url_2, description, size, String(collections)]
      );

      const productId = res.rows[0]?.id;

      if (collections && productId) {
        for (const h of String(collections).split(/[|,]/).filter(Boolean)) {
          const cleanHandle = slugify(h);
          if (!cleanHandle) continue;
          await client.query(
            'INSERT INTO collections (handle, title) VALUES ($1, $2) ON CONFLICT (handle) DO NOTHING',
            [cleanHandle, h.trim()]
          );
          await client.query(
            `INSERT INTO product_collections (product_id, collection_id)
             SELECT $1, id FROM collections WHERE handle = $2
             ON CONFLICT DO NOTHING`,
            [productId, cleanHandle]
          );
        }
      }

      imported++;
    }

    await client.query('COMMIT');
    console.log(`Successfully imported ${imported} products into Perfume Zone PostgreSQL database!`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Import error:', err);
  process.exit(1);
});
