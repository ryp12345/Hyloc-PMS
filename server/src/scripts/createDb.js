require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'postgres',
  });
  try {
    await adminClient.connect();
    const dbName = process.env.DB_NAME;
    const check = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (check.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (e) {
    console.error('DB create error', e);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
})();
