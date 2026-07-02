const { DataTypes } = require('sequelize');
const db = require('../db');
const sequelize = db.sequelize;

const Proveedor = sequelize.define('Proveedor', {
    id_proveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    direccion: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'proveedores',
    timestamps: false
});

module.exports = Proveedor;
