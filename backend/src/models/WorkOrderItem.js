const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrderItem = sequelize.define('WorkOrderItem', {
  workOrderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'work_order_id' },
  type: {
    type: DataTypes.ENUM('MANO_OBRA', 'REPUESTO'), allowNull: false,
    validate: { isIn: { args: [['MANO_OBRA', 'REPUESTO']], msg: 'type debe ser MANO_OBRA o REPUESTO' } },
  },
  description: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: { msg: 'La descripcion es obligatoria' } } },
  count: {
    type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
    validate: { isInt: { msg: 'La cantidad debe ser entera' }, min: { args: [1], msg: 'La cantidad debe ser mayor a 0' } },
  },
  unitValue: {
    type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_value',
    validate: { min: { args: [0], msg: 'El valor unitario debe ser >= 0' } },
  },
}, { tableName: 'work_order_items' });

module.exports = WorkOrderItem;
