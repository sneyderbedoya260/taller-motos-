const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  name: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: { msg: 'El nombre es obligatorio' } } },
  phone: { type: DataTypes.STRING(30), allowNull: false, validate: { notEmpty: { msg: 'El telefono es obligatorio' } } },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: { msg: 'Email invalido' } },
    set(v) { this.setDataValue('email', v === '' ? null : v); },
  },
}, { tableName: 'clients' });

module.exports = Client;
