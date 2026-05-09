'use client';

import { useState, useTransition, useEffect } from 'react';
import { getSalidas, createSalida, deleteSalida, updateSalida, getBodegaStatus } from './actions';
import Modal from '@/components/Modal';

type Salida = Awaited<ReturnType<typeof getSalidas>>[0];
type Status = Awaited<ReturnType<typeof getBodegaStatus>>;

export default function BodegaPage() {
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editingSalida, setEditingSalida] = useState<Salida | null>(null);

  const loadData = async () => {
    const [salidasData, statusData] = await Promise.all([
      getSalidas(),
      getBodegaStatus()
    ]);
    setSalidas(salidasData);
    setStatus(statusData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    startTransition(async () => {
      await createSalida(formData);
      form.reset();
      await loadData();
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSalida) return;
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await updateSalida(editingSalida.id, formData);
      setEditingSalida(null);
      await loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de salida?')) return;
    startTransition(async () => {
      await deleteSalida(id);
      await loadData();
    });
  };

  const formatDestino = (d: string) => d.replace(/_/g, ' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 className="page-title">Inventario de Bodega</h1>

      {/* Resumen de Existencias */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Café Pergamino Seco</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            {(status?.pergaminoSeco ?? 0).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 400 }}>kg</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {(status?.totales.entradasSeco ?? 0)} kg producidos — {(status?.totales.salidasSeco ?? 0)} kg salidas
          </p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pasilla / Segunda</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>
            {(status?.pasilla ?? 0).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 400 }}>kg</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {(status?.totales.entradasPasilla ?? 0)} kg producidos — {(status?.totales.salidasPasilla ?? 0)} kg salidas
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Formulario Salida */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Registrar Salida</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Fecha</label>
              <input name="fecha" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Tipo de Café</label>
              <select name="tipo" required>
                <option value="PERGAMINO_SECO">Pergamino Seco</option>
                <option value="PASILLA">Pasilla / Segunda</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad (kg)</label>
              <input name="cantidad" type="number" step="0.1" required placeholder="0.0" />
            </div>
            <div className="form-group">
              <label>Destino</label>
              <select name="destino" required>
                <option value="VENTA_COOPERATIVA">Venta a Cooperativa</option>
                <option value="TOSTION">Salida para Tostión</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea name="notas" rows={2} placeholder="Detalles opcionales..."></textarea>
            </div>
            <button type="submit" className="primary" disabled={isPending}>
              {isPending ? 'Procesando...' : 'Registrar Salida'}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Historial de Salidas</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Destino</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {salidas.map(s => (
                <tr key={s.id}>
                  <td>{new Date(s.fecha).toLocaleDateString()}</td>
                  <td>{s.tipo === 'PERGAMINO_SECO' ? 'Pergamino Seco' : 'Pasilla'}</td>
                  <td style={{ fontWeight: 700 }}>{s.cantidad} kg</td>
                  <td>{formatDestino(s.destino)}</td>
                  <td className="actions-cell">
                    <button className="secondary" onClick={() => setEditingSalida(s)}>Editar</button>
                    <button className="danger" onClick={() => handleDelete(s.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {salidas.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros de salidas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!editingSalida} onClose={() => setEditingSalida(null)} title="Editar Registro de Salida">
        {editingSalida && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Fecha</label>
              <input name="fecha" type="date" required defaultValue={new Date(editingSalida.fecha).toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Tipo de Café</label>
              <select name="tipo" required defaultValue={editingSalida.tipo}>
                <option value="PERGAMINO_SECO">Pergamino Seco</option>
                <option value="PASILLA">Pasilla / Segunda</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad (kg)</label>
              <input name="cantidad" type="number" step="0.1" required defaultValue={editingSalida.cantidad} />
            </div>
            <div className="form-group">
              <label>Destino</label>
              <select name="destino" required defaultValue={editingSalida.destino}>
                <option value="VENTA_COOPERATIVA">Venta a Cooperativa</option>
                <option value="TOSTION">Salida para Tostión</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea name="notas" rows={2} defaultValue={editingSalida.notas || ''}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="primary" style={{ flex: 1 }} disabled={isPending}>
                {isPending ? 'Guardando...' : 'Actualizar'}
              </button>
              <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditingSalida(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
