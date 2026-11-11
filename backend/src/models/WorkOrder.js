const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrder = sequelize.define('WorkOrder', {
  bikeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'bike_id' },
  entryDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'entry_date' },
  faultDescription: {
    type: DataTypes.TEXT, allowNull: false, field: 'fault_description',
    validate: { notEmpty: { msg: 'La descripcion de la falla es obligatoria' } },
  },
  status: {
    type: DataTypes.ENUM('RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'),
    allowNull: false, defaultValue: 'RECIBIDA',
  },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
}, { tableName: 'work_orders' });

module.exports = WorkOrder;
