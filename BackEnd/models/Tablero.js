const { DataTypes } = require('sequelize');
const db = require('../db');
const sequelize = db.sequelize;
const Proveedor = require('./Proveedor');

const Tablero = sequelize.define('Tablero', {
    id_tablero: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('MELAMINA', 'MDF', 'TRIPLEX'),
        allowNull: false
    },
    color: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    textura: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    ancho: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    alto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    espesor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    precio_tablero: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    costo_corte: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    id_proveedor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Proveedor,
            key: 'id_proveedor'
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'tableros',
    timestamps: false
});

// Relaciones
Tablero.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });
Proveedor.hasMany(Tablero, { foreignKey: 'id_proveedor' });

module.exports = Tablero;
