const mysql = require('mysql2');
const { Sequelize } = require('sequelize');

// Inicializar el Pool de mysql2 convencional
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Wilmer14', 
    database: process.env.DB_NAME || 'sistema_muebles',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0
});

// Verificar conexión convencional
pool.query('SELECT 1', (err) => {
    if (err) {
        console.error('Error de conexión al Pool de MySQL ❌:', err);
    } else {
        console.log('Conectado a MySQL (Pool) ✅');
    }
});

// Inicializar instancia de Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME || 'sistema_muebles',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'Wilmer14',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Desactivar logs de consultas para mantener la terminal limpia
        pool: {
            max: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Verificar conexión de Sequelize
sequelize.authenticate()
    .then(() => {
        console.log('Conexión con Sequelize establecida correctamente. ORM Listo ✅');
    })
    .catch(err => {
        console.error('No se pudo conectar a la base de datos con Sequelize ❌:', err);
    });

// Acoplamos sequelize al pool para que sea accesible importándolo de manera estructurada
pool.sequelize = sequelize;
pool.Sequelize = Sequelize;

module.exports = pool;