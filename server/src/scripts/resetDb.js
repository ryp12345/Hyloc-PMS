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
    // Drop if exists
    await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    // Create fresh
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database ${dbName} reset (dropped & recreated).`);
  } catch (e) {
    console.error('DB reset error', e);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
})();
