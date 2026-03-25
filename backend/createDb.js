const { Client } = require('pg');
async function setup() {
  const client = new Client({ connectionString: process.env.DATABASE_URL?.replace('/scard_abu', '/postgres') || "postgres://postgres:password@localhost:5432/postgres" });
  try {
    await client.connect();
    await client.query('CREATE DATABASE scard_abu');
    console.log("Database created");
  } catch (e) {
    console.log("Database may already exist: " + e.message);
  } finally {
    await client.end();
  }
}
setup();
