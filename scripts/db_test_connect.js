// Test script that uses utils/db.getConnection to attempt a simple query against the stored remote DB
(async () => {
  try {
    const { getConnection } = require('../utils/db');
    console.log('Attempting to get DB connection from stored secret...');
    const conn = await getConnection();
    try {
      const [rows] = await conn.query('SELECT COUNT(*) as c FROM prq_automoviles');
      console.log('Query succeeded, count:', rows[0].c);
    } finally {
      await conn.end();
    }
  } catch (err) {
    console.error('DB connection test failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
