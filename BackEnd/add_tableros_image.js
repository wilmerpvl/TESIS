const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Wilmer14', 
    database: 'sistema_muebles'
});

connection.connect(err => {
    if (err) {
        console.error('Error de conexión:', err);
        process.exit(1);
    }
    
    connection.query(
        `ALTER TABLE tableros ADD COLUMN imagen VARCHAR(255) NULL`,
        (err, results) => {
            if (err) {
                console.log("Note:", err.message);
            } else {
                console.log("Column 'imagen' added to 'tableros' successfully.");
            }
            connection.end();
            process.exit(0);
        }
    );
});
