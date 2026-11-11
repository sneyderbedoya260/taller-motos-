const { Op } = require('sequelize');
const { sequelize, Bike, Client, WorkOrder, WorkOrderItem } = require('../models');
const AppError = require('../utils/AppError');
const { ESTADOS, ESTADOS_FINALES, obtenerTransiciones, validarTransicion } = require('../utils/orderStatus');

async function recalcularTotal(idOrden, transaccion) {
  const resultado = await WorkOrderItem.findOne({
    attributes: [[sequelize.literal('COALESCE(SUM(`count` * `unit_value`), 0)'), 'total']],
    where: { workOrderId: idOrden },
    raw: true,
    transaction: transaccion,
  });
  const total = resultado.total;
  await WorkOrder.update({ total }, { where: { id: idOrden }, transaction: transaccion });
  return total;
}

async function crearOrden({
  bikeId: idMoto,
  faultDescription: descripcionFalla,
  entryDate: fechaEntrada,
}) {
  const moto = await Bike.findByPk(idMoto);
  if (!moto) throw new AppError('Moto no encontrada', 404);

  return WorkOrder.create({
    bikeId: idMoto,
    faultDescription: descripcionFalla,
    entryDate: fechaEntrada,
  });
}

async function listarOrdenes({
  status: estado,
  plate: placa,
  page: pagina = 1,
  pageSize: tamanoPagina = 10,
} = {}) {
  if (estado && !Object.values(ESTADOS).includes(estado)) {
    throw new AppError(`Estado '${estado}' no valido. Validos: ${Object.values(ESTADOS).join(', ')}`, 400);
  }

  const paginaValida = Number(pagina);
  const tamanoValido = Number(tamanoPagina);
  if (!Number.isInteger(paginaValida) || paginaValida < 1) {
    throw new AppError('page debe ser un entero mayor a 0', 400);
  }
  if (!Number.isInteger(tamanoValido) || tamanoValido < 1) {
    throw new AppError('pageSize debe ser un entero mayor a 0', 400);
  }
  const tamano = Math.min(tamanoValido, 100);

  const incluirMoto = {
    model: Bike,
    as: 'bike',
    include: [{ model: Client, as: 'client' }],
  };
  if (placa) {
    incluirMoto.where = { plate: { [Op.like]: `%${placa}%` } };
    incluirMoto.required = true;
  }

  const resultado = await WorkOrder.findAndCountAll({
    where: estado ? { status: estado } : {},
    include: [incluirMoto],
    order: [['entryDate', 'DESC']],
    limit: tamano,
    offset: (paginaValida - 1) * tamano,
  });

  return {
    data: resultado.rows,
    page: paginaValida,
    pageSize: tamano,
    total: resultado.count,
    totalPages: Math.ceil(resultado.count / tamano),
  };
}

async function obtenerOrdenPorId(idOrden) {
  const orden = await WorkOrder.findByPk(idOrden, {
    include: [
      {
        model: Bike,
        as: 'bike',
        include: [{ model: Client, as: 'client' }],
      },
      { model: WorkOrderItem, as: 'items' },
    ],
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);

  return { ...orden.toJSON(), allowedTransitions: obtenerTransiciones(orden.status) };
}

async function cambiarEstado(idOrden, nuevoEstado) {
  return sequelize.transaction(async (transaccion) => {
    const orden = await WorkOrder.findByPk(idOrden, {
      transaction: transaccion,
      lock: transaccion.LOCK.UPDATE,
    });
    if (!orden) throw new AppError('Orden no encontrada', 404);

    validarTransicion(orden.status, nuevoEstado);
    await orden.update({ status: nuevoEstado }, { transaction: transaccion });
    return orden;
  });
}

async function agregarItem(idOrden, datos) {
  return sequelize.transaction(async (transaccion) => {
    const orden = await WorkOrder.findByPk(idOrden, {
      transaction: transaccion,
      lock: transaccion.LOCK.UPDATE,
    });
    if (!orden) throw new AppError('Orden no encontrada', 404);
    if (ESTADOS_FINALES.includes(orden.status)) {
      throw new AppError(`No se pueden agregar items a una orden en estado ${orden.status}`, 400);
    }

    const articulo = await WorkOrderItem.create({ ...datos, workOrderId: orden.id }, { transaction: transaccion });
    await recalcularTotal(orden.id, transaccion);
    return articulo;
  });
}

async function quitarItem(idItem) {
  return sequelize.transaction(async (transaccion) => {
    const articulo = await WorkOrderItem.findByPk(idItem, {
      transaction: transaccion,
      lock: transaccion.LOCK.UPDATE,
    });
    if (!articulo) throw new AppError('Item no encontrado', 404);

    const orden = await WorkOrder.findByPk(articulo.workOrderId, {
      transaction: transaccion,
      lock: transaccion.LOCK.UPDATE,
    });
    if (!orden) throw new AppError('Orden no encontrada', 404);
    if (ESTADOS_FINALES.includes(orden.status)) {
      throw new AppError(`No se pueden eliminar items de una orden en estado ${orden.status}`, 400);
    }

    await articulo.destroy({ transaction: transaccion });
    await recalcularTotal(orden.id, transaccion);
    return articulo;
  });
}

module.exports = {
  recalcularTotal,
  crearOrden,
  listarOrdenes,
  obtenerOrdenPorId,
  cambiarEstado,
  agregarItem,
  quitarItem,
};
