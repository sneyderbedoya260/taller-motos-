require('dotenv').config();
const aplicacion = require('./app');
const { sequelize: conexion } = require('./models');

const puerto = process.env.PORT || 4000;

(async () => {
  try {
    await conexion.authenticate();
    console.log('Conectado a MySQL');
    if (process.env.DB_SYNC === 'true') {
      await conexion.sync();
      console.log('Tablas sincronizadas');
    }
    aplicacion.listen(puerto, () => console.log(`API en http://localhost:${puerto}/api`));
  } catch (errorInicio) {
    console.error('No se pudo iniciar:', errorInicio);
    process.exit(1);
  }
})();
