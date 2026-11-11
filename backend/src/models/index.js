const sequelize = require('../config/database');
const Client = require('./Client');
const Bike = require('./Bike');
const WorkOrder = require('./WorkOrder');
const WorkOrderItem = require('./WorkOrderItem');

Client.hasMany(Bike, { foreignKey: 'clientId', as: 'bikes' });
Bike.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Bike.hasMany(WorkOrder, { foreignKey: 'bikeId', as: 'workOrders' });
WorkOrder.belongsTo(Bike, { foreignKey: 'bikeId', as: 'bike' });

WorkOrder.hasMany(WorkOrderItem, { foreignKey: 'workOrderId', as: 'items', onDelete: 'CASCADE' });
WorkOrderItem.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });

module.exports = { sequelize, Client, Bike, WorkOrder, WorkOrderItem };
