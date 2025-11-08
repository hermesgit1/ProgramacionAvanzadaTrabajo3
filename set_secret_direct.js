// Script to store provided MySQL credentials into OS credential store using keytar.
// Usage: node set_secret_direct.js
// It stores under service 'ProgramacionAvanzadaTrabajo3.MySQL' and account 'user@host:port/database'

(async () => {
  try {
    const keytar = require('keytar');
    const service = 'ProgramacionAvanzadaTrabajo3.MySQL';

    // Credentials provided (from your message)
    const host = 'hecferme-progra-avanzada-mysql.mysql.database.azure.com';
    const port = 3306;
    const user = 'user03';
    const password = 'StrongPwd_03!';
    const database = 'sistema_parqueo';

    const account = `${user}@${host}:${port}/${database}`;
    const secret = JSON.stringify({ host, port, user, password, database });

    await keytar.setPassword(service, account, secret);
    console.log('Secret stored successfully.');
    console.log('Service:', service);
    console.log('Account:', account);
    console.log('To retrieve the connection string run: node get_connection_string.js "' + account + '"');
  } catch (err) {
    console.error('Error storing secret:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
