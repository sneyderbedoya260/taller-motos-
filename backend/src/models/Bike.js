const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bike = sequelize.define('Bike', {
  plate: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: { msg: 'La placa ya esta registrada' },
    validate: { notEmpty: { msg: 'La placa es obligatoria' } },
    set(v) { this.setDataValue('plate', String(v || '').trim().toUpperCase()); },
  },
  brand: { type: DataTypes.STRING(60), allowNull: false, validate: { notEmpty: { msg: 'La marca es obligatoria' } } },
  model: { type: DataTypes.STRING(60), allowNull: false, validate: { notEmpty: { msg: 'El modelo es obligatorio' } } },
  cylinder: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, validate: { min: { args: [1], msg: 'Cilindraje invalido' } } },
  clientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'client_id' },
}, { tableName: 'bikes' });

module.exports = Bike;
