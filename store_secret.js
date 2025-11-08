/*
Store MySQL connection info in OS credential store using keytar.
Usage: node store_secret.js
It will prompt for: host, port, username, password, database.
Service name defaults to "ProgramacionAvanzadaTrabajo3.MySQL".
The secret stored is a JSON string with these fields.
*/

(async () => {
  try {
    const keytar = require('keytar');
    const readline = require('readline');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (q, def) => new Promise(resolve => {
      rl.question(q + (def ? ` (${def})` : '') + ': ', answer => resolve(answer || def));
    });

    const service = await question('Service name', 'ProgramacionAvanzadaTrabajo3.MySQL');
    const host = await question('MySQL host (ej. db.example.com)');
    const port = await question('MySQL port', '3306');
    const user = await question('MySQL user');
    const password = await question('MySQL password');
    const database = await question('Database name (ej. sistema_parqueo)');

    rl.close();

    const account = `${user}@${host}:${port}/${database}`;
    const secret = JSON.stringify({ host, port: Number(port), user, password, database });

    await keytar.setPassword(service, account, secret);
    console.log('\nSecret saved in OS credential store.');
    console.log('Service:', service);
    console.log('Account:', account);
    console.log('\nExample connection string (with password):');
    console.log(`mysql://${user}:${password}@${host}:${port}/${database}`);
    console.log('\nExample connection string (masked password):');
    console.log(`mysql://${user}:*****@${host}:${port}/${database}`);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    console.error('If you don\'t have keytar installed, run: npm install keytar');
    process.exit(1);
  }
})();
