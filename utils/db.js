const keytar = require('keytar');
const mysql = require('mysql2/promise');

const SERVICE = 'ProgramacionAvanzadaTrabajo3.MySQL';

async function getStoredSecret(account) {
  if (account) {
    const s = await keytar.getPassword(SERVICE, account);
    if (!s) throw new Error('No secret found for account ' + account);
    return s;
  }
  const creds = await keytar.findCredentials(SERVICE);
  if (!creds || creds.length === 0) throw new Error('No stored credentials found for service ' + SERVICE);
  // pick first
  return creds[0].password;
}

async function getConnection(account) {
  try {
    // Use local MySQL connection
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Hermes',
      database: 'sistema_parqueo'
    });
    return conn;
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
}

module.exports = { getConnection };
