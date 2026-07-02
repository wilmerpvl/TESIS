const { DataTypes } = require('sequelize');
const db = require('../db');
const sequelize = db.sequelize;
const Proveedor = require('./Proveedor');

const Accesorio = sequelize.define('Accesorio', {
    id_accesorio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    material: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    tamano: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
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
    tableName: 'accesorios',
    timestamps: false
});

// Relaciones
Accesorio.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });
Proveedor.hasMany(Accesorio, { foreignKey: 'id_proveedor' });

module.exports = Accesorio;
