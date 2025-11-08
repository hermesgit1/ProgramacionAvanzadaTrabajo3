const mysql = require('mysql2');
const fs = require('fs');

// Create the connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Hermes',
    database: 'sistema_parqueo',
    port: 3306,
    multipleStatements: true
});

// Connect to the database and execute queries
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to the database!');
    
    // Execute SQL file
    try {
        const sqlFile = fs.readFileSync('insertar-registros.sql', 'utf8');
        connection.query(sqlFile, (error, results) => {
            if (error) {
                console.error('Error executing queries:', error);
            } else {
                console.log('All queries executed successfully!');
                if (Array.isArray(results)) {
                    results.forEach((result, index) => {
                        console.log(`Query ${index + 1}: ${result.affectedRows} rows affected`);
                    });
                }
            }
            connection.end((err) => {
                if (err) {
                    console.error('Error closing connection:', err);
                    return;
                }
                console.log('Connection closed successfully');
            });
        });
    } catch (error) {
        console.error('Error reading SQL file:', error);
        connection.end();
    }
});