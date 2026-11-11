import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import ListaOrdenes from './pages/OrdersList.jsx';
import CrearOrden from './pages/CreateOrder.jsx';
import DetalleOrden from './pages/OrderDetail.jsx';

export default function Aplicacion() {
  return (
    <>
      <header className="nav">
        <strong>Taller de Motos</strong>
        <NavLink to="/orders">Ordenes</NavLink>
        <NavLink to="/orders/new">Nueva orden</NavLink>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<ListaOrdenes />} />
          <Route path="/orders/new" element={<CrearOrden />} />
          <Route path="/orders/:id" element={<DetalleOrden />} />
          <Route path="*" element={<p>Pagina no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}
