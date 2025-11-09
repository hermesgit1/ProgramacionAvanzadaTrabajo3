// Script to update the stored MySQL secret password for the existing account
(async () => {
  try {
    const keytar = require('keytar');
    const service = 'ProgramacionAvanzadaTrabajo3.MySQL';
    const host = 'hecferme-progra-avanzada-mysql.mysql.database.azure.com';
    const port = 3306;
    const user = 'user03';
    const database = 'sistema_parqueo';
    const newPassword = 'StrongPwd_[03]!';

    const account = `${user}@${host}:${port}/${database}`;
    const secret = JSON.stringify({ host, port, user, password: newPassword, database });

    await keytar.setPassword(service, account, secret);
    console.log('Secret updated successfully.');
    console.log('Service:', service);
    console.log('Account:', account);
  } catch (err) {
    console.error('Error updating secret:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
