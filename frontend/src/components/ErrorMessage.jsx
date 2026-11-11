export default function MensajeError({ mensaje }) {
  if (!mensaje) return null;
  return <div className="error">{mensaje}</div>;
}
