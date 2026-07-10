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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    startTransition(async () => {
      const res = await createSalida(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        form.reset();
        await loadData();
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSalida) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await updateSalida(editingSalida.id, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setEditingSalida(null);
        await loadData();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de salida?')) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteSalida(id);
      if (res?.error) {
        setError(res.error);
      } else {
        await loadData();
      }
    });
  };

  const formatDestino = (d: string) => {
    switch (d) {
      case 'VENTA_COOPERATIVA': return 'Venta a Cooperativa';
      case 'TOSTION': return 'Salida para Tostión';
      case 'OTRO': return 'Otro';
      default: return d.replace(/_/g, ' ');
    }
  };

  const formatTipo = (tipo: string, metodo?: string | null) => {
    if (tipo === 'PERGAMINO_SECO') return 'Pergamino Seco';
    if (tipo === 'SEGUNDAS' || (tipo === 'PASILLA' && metodo === 'FERMENTADO')) return 'Café de Segunda';
    return 'Pasilla';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 className="page-title">Inventario de Bodega</h1>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>⚠️ {error}</span>
          <button 
            type="button" 
            onClick={() => setError(null)} 
            style={{ 
              background: 'transparent', 
              color: 'var(--danger)', 
              border: 'none', 
              padding: '0 0.5rem',
              fontWeight: 'bold',
              fontSize: '1.15rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Resumen de Existencias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {/* Café de Beneficio Lavado Seco */}
        <div className="glass-card" style={{ textAlign: 'center', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Café Beneficio Lavado Seco</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            {(status?.pergaminoSecoLavado ?? 0).toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>kg</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {(status?.totales.entradasSecoLavado ?? 0)} kg prod. — {(status?.totales.salidasSecoLavado ?? 0)} kg sal.
          </p>
        </div>

        {/* Café de Beneficio Fermentado Seco */}
        <div className="glass-card" style={{ textAlign: 'center', borderLeft: '4px solid #ec4899', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Café Beneficio Fermentado Seco</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899', margin: 0 }}>
            {(status?.pergaminoSecoFermentado ?? 0).toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>kg</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {(status?.totales.entradasSecoFermentado ?? 0)} kg prod. — {(status?.totales.salidasSecoFermentado ?? 0)} kg sal.
          </p>
        </div>

        {/* Pasillas (B. Lavado) */}
        <div className="glass-card" style={{ textAlign: 'center', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pasillas (B. Lavado)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>
            {(status?.pasillaLavado ?? 0).toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>kg</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {(status?.totales.entradasPasillaLavado ?? 0)} kg prod. — {(status?.totales.salidasPasillaLavado ?? 0)} kg sal.
          </p>
        </div>

        {/* Café de Segunda (B. Fermentado) */}
        <div className="glass-card" style={{ textAlign: 'center', borderLeft: '4px solid #6366f1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Café de Segunda (B. Fermentado)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1', margin: 0 }}>
            {(status?.pasillaFermentado ?? 0).toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>kg</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {(status?.totales.entradasPasillaFermentado ?? 0)} kg prod. — {(status?.totales.salidasPasillaFermentado ?? 0)} kg sal.
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
                <option value="PASILLA">Pasilla</option>
                <option value="SEGUNDAS">Café de Segunda</option>
              </select>
            </div>
            <div className="form-group">
              <label>Método de Beneficio</label>
              <select name="metodoBeneficio" required>
                <option value="LAVADO">Lavado</option>
                <option value="FERMENTADO">Fermentado</option>
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
          <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ backgroundColor: 'var(--surface)' }}>
                  <th style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border)', zIndex: 11 }}>Fecha</th>
                  <th style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border)', zIndex: 11 }}>Tipo</th>
                  <th style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border)', zIndex: 11 }}>Beneficio</th>
                  <th style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border)', zIndex: 11 }}>Cantidad</th>
                  <th style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border)', zIndex: 11 }}>Destino</th>
                  <th style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border)', zIndex: 11 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salidas.map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.fecha).toLocaleDateString()}</td>
                    <td>{formatTipo(s.tipo, s.metodoBeneficio)}</td>
                    <td>{s.metodoBeneficio === 'FERMENTADO' ? 'Fermentado' : 'Lavado'}</td>
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
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros de salidas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                <option value="PASILLA">Pasilla</option>
                <option value="SEGUNDAS">Café de Segunda</option>
              </select>
            </div>
            <div className="form-group">
              <label>Método de Beneficio</label>
              <select name="metodoBeneficio" required defaultValue={editingSalida.metodoBeneficio || 'LAVADO'}>
                <option value="LAVADO">Lavado</option>
                <option value="FERMENTADO">Fermentado</option>
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
