const mysql = require('mysql2/promise');

async function checkDatabase() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Hermes',
            database: 'sistema_parqueo'
        });

        console.log('Connected to MySQL successfully!');

        // Check tables
        const [tables] = await conn.query('SHOW TABLES');
        console.log('\nAvailable tables:');
        console.log(tables);

        // Check sample data
        console.log('\nChecking prq_automoviles:');
        const [autos] = await conn.query('SELECT * FROM prq_automoviles LIMIT 5');
        console.log(autos);

        await conn.end();
    } catch (err) {
        console.error('Database error:', err);
    }
}

checkDatabase();