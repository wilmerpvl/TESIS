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
    
    const tables = ['clientes', 'accesorios', 'auditoria', 'avances', 'cotizaciones'];
    let index = 0;
    
    function describeNext() {
        if (index >= tables.length) {
            connection.end();
            process.exit(0);
            return;
        }
        let table = tables[index];
        connection.query(`DESCRIBE ${table}`, (err, columns) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`=== TABLE: ${table} ===`);
                columns.forEach(c => {
                    console.log(`Field: ${c.Field}, Type: ${c.Type}, Default: ${c.Default}, Null: ${c.Null}`);
                });
            }
            index++;
            describeNext();
        });
    }
    
    describeNext();
});
