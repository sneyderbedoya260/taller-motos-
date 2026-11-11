const { Op } = require('sequelize');
const { Client, Bike } = require('../models');
const AppError = require('../utils/AppError');

exports.crear = async (solicitud, respuesta) => {
  const { name: nombre, phone: telefono, email: correo } = solicitud.body;
  const cliente = await Client.create({ name: nombre, phone: telefono, email: correo });
  respuesta.status(201).json(cliente);
};

exports.listar = async (solicitud, respuesta) => {
  const { search: busqueda } = solicitud.query;
  const filtro = busqueda
    ? { [Op.or]: [{ name: { [Op.like]: `%${busqueda}%` } }, { phone: { [Op.like]: `%${busqueda}%` } }] }
    : {};
  const clientes = await Client.findAll({ where: filtro, order: [['name', 'ASC']], limit: 50 });
  respuesta.json(clientes);
};

exports.obtenerPorId = async (solicitud, respuesta) => {
  const cliente = await Client.findByPk(solicitud.params.id, { include: [{ model: Bike, as: 'bikes' }] });
  if (!cliente) throw new AppError('Cliente no encontrado', 404);
  respuesta.json(cliente);
};
