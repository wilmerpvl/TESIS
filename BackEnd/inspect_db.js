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
        `SELECT a.*, e.url_imagen 
         FROM avances a 
         LEFT JOIN evidencias e ON a.id_avance = e.id_avance 
         WHERE a.id_trabajo = 2`,
        (err, results) => {
            if (err) {
                console.error(err);
            } else {
                console.log("AVANCES Y EVIDENCIAS DE TRABAJO #2:");
                console.log(JSON.stringify(results, null, 2));
            }
            connection.end();
            process.exit(0);
        }
    );
});
