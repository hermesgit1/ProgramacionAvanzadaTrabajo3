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
  const secretStr = await getStoredSecret(account);
  const secret = JSON.parse(secretStr);
  // secret expected: { host, port, user, password, database }
  const conn = await mysql.createConnection({
    host: secret.host,
    port: secret.port,
    user: secret.user,
    password: secret.password,
    database: secret.database,
    // connectionLimit not used for single connection
  });
  return conn;
}

module.exports = { getConnection };
