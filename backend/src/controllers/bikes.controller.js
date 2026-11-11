const { Op } = require('sequelize');
const { Client, Bike } = require('../models');
const AppError = require('../utils/AppError');

exports.crear = async (solicitud, respuesta) => {
  const { plate: placa, brand: marca, model: modelo, cylinder: cilindraje, clientId: idCliente } = solicitud.body;
  const cliente = await Client.findByPk(idCliente);
  if (!cliente) throw new AppError('Cliente no encontrado', 404);

  const moto = await Bike.create({
    plate: placa,
    brand: marca,
    model: modelo,
    cylinder: cilindraje,
    clientId: idCliente,
  });
  respuesta.status(201).json(moto);
};

exports.listar = async (solicitud, respuesta) => {
  const { plate: placa } = solicitud.query;
  const filtro = placa ? { plate: { [Op.like]: `%${placa}%` } } : {};
  const motos = await Bike.findAll({
    where: filtro,
    include: [{ model: Client, as: 'client' }],
    order: [['plate', 'ASC']],
    limit: 50,
  });
  respuesta.json(motos);
};

exports.obtenerPorId = async (solicitud, respuesta) => {
  const moto = await Bike.findByPk(solicitud.params.id, {
    include: [{ model: Client, as: 'client' }],
  });
  if (!moto) throw new AppError('Moto no encontrada', 404);
  respuesta.json(moto);
};
