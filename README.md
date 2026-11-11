# taller-motos-

aplicacion web para llevar el control de alistamientos y reparaciones de un taller de motos. permite registrar clientes, motos y ordenes de trabajo con sus items (mano de obra y repuestos).

- backend: node.js, express, sequelize, mysql
- frontend: react (vite), react router, axios

## requisitos

- node.js 18 o superior
- mysql 8 (o mariadb 10.5 o superior)

## estructura

```
backend/    api rest
frontend/   aplicacion web
database/   script sql con las tablas
docs/       coleccion de postman
```

## instalacion

### 1. base de datos

el script crea la base `taller_motos` y las tablas. desde la raiz del proyecto:

```
mysql -u root -p < database/schema.sql
```

en powershell, donde el operador `<` no funciona:

```
Get-Content database/schema.sql | mysql -u root -p
```

### 2. backend

```
cd backend
npm install
```

copiar `.env.example` a `.env` y completar los datos de conexion (ver variables de entorno). luego:

```
npm run dev
```

la api queda en `http://localhost:4000/api`. para produccion se usa `npm start`.

### despliegue en Railway (un solo servicio)

conecta el repositorio y deja **Root Directory** vacio para desplegar desde la raiz del proyecto. Railway usara `npm run build` para instalar y compilar el frontend, y `npm start` para iniciar el backend, que tambien sirve la aplicacion web en el mismo dominio. configura las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` para la base de datos. Railway asigna `PORT` automaticamente.

### 3. frontend

en otra terminal:

```
cd frontend
npm install
```

copiar `.env.example` a `.env` y luego:

```
npm run dev
```

abrir `http://localhost:5173`.

Para el despliegue separado con el backend en Render y el frontend en Vercel, configura `VITE_API_URL` en Vercel con la URL publica del backend terminada en `/api` y vuelve a desplegar el frontend. En Render, configura `CORS_ORIGIN` con el dominio de Vercel.

## variables de entorno

backend (`backend/.env`):

| variable | descripcion | ejemplo |
|---|---|---|
| `PORT` | puerto de la api | `4000` |
| `DB_HOST` | servidor de mysql | `localhost` |
| `DB_PORT` | puerto de mysql | `3306` |
| `DB_NAME` | nombre de la base | `taller_motos` |
| `DB_USER` | usuario de mysql | `root` |
| `DB_PASSWORD` | clave de mysql | |
| `DB_SSL` | habilita TLS para proveedores administrados como TiDB Cloud | `false` |
| `DB_SYNC` | si es `true`, sequelize crea las tablas faltantes al iniciar. con el script sql se deja en `false` | `false` |
| `CORS_ORIGIN` | origenes adicionales permitidos, separados por coma; el dominio principal de Vercel ya esta permitido | `http://localhost:5173` |

frontend (`frontend/.env`):

| variable | descripcion | ejemplo |
|---|---|---|
| `VITE_API_URL` | url base de la api; en Vercel usa el dominio del backend Render terminado en `/api` | `http://localhost:4000/api` |

## endpoints

| metodo | ruta | descripcion |
|---|---|---|
| POST | `/api/clients` | crear cliente |
| GET | `/api/clients?search=` | buscar clientes por nombre o telefono |
| GET | `/api/clients/:id` | detalle de cliente con sus motos |
| POST | `/api/bikes` | crear moto |
| GET | `/api/bikes?plate=` | buscar motos por placa |
| GET | `/api/bikes/:id` | detalle de moto |
| POST | `/api/work-orders` | crear orden |
| GET | `/api/work-orders?status=&plate=&page=&pageSize=` | listar ordenes con filtros y paginacion |
| GET | `/api/work-orders/:id` | detalle de orden con cliente, moto e items |
| PATCH | `/api/work-orders/:id/status` | cambiar estado |
| POST | `/api/work-orders/:id/items` | agregar item |
| DELETE | `/api/work-orders/items/:itemId` | eliminar item |

los errores responden `{ "message": "...", "details": [...] }` con el codigo http correspondiente (400, 404, 409, 500).

## reglas de negocio

- las placas se guardan en mayusculas y no se pueden repetir (409).
- una orden requiere una moto existente y la descripcion de la falla.
- flujo de estados: `RECIBIDA`, `DIAGNOSTICO`, `EN_PROCESO`, `LISTA`, `ENTREGADA`.
- se puede pasar a `CANCELADA` desde cualquier estado excepto `ENTREGADA`.
- una transicion invalida responde 400 con un mensaje que indica las transiciones permitidas.
- items: la cantidad debe ser mayor a 0 y el valor unitario mayor o igual a 0.
- el total de la orden se recalcula en el servidor (cantidad por valor unitario) cada vez que se agrega o elimina un item.
- no se pueden agregar ni eliminar items de ordenes entregadas o canceladas.

## pruebas con postman

importar `docs/postman_collection.json`. la variable `baseUrl` apunta a `http://localhost:4000/api`.
