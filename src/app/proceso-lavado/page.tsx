'use client';

import { useState, useTransition, useEffect } from 'react';
import { getProcesosLavado, getLotes, createProcesoLavado, deleteProcesoLavado, updateProcesoLavado } from './actions';
import Modal from '@/components/Modal';

type Proceso = Awaited<ReturnType<typeof getProcesosLavado>>[0];
type Lote = Awaited<ReturnType<typeof getLotes>>[0];

export default function ProcesoLavadoPage() {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editingProceso, setEditingProceso] = useState<Proceso | null>(null);

  const loadData = async () => {
    const [p, l] = await Promise.all([getProcesosLavado(), getLotes()]);
    setProcesos(p);
    setLotes(l);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    startTransition(async () => {
      await createProcesoLavado(formData);
      form.reset();
      const fechaInput = form.elements.namedItem('fecha') as HTMLInputElement | null;
      if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];
      await loadData();
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProceso) return;
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await updateProcesoLavado(editingProceso.id, formData);
      setEditingProceso(null);
      await loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    startTransition(async () => {
      await deleteProcesoLavado(id);
      await loadData();
    });
  };

  return (
    <div>
      <h1 className="page-title">Proceso de Beneficio: Tradicional Lavado</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Registrar Lote Procesado</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 2fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Fecha de Proceso</label>
              <input name="fecha" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Lote de Origen (Cereza Disponible)</label>
              <select name="loteId" required>
                <option value="">Seleccione Lote</option>
                {lotes.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nombre} — Disp: {l.disponible} kg
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Cereza Procesada (kg)</label>
              <input name="pesoCerezaProcesada" type="number" step="0.1" required placeholder="0.0" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Café Mojado (kg)</label>
              <input name="pesoCafeMojado" type="number" step="0.1" placeholder="Ej. 100.5" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Pasilla Mojada (kg)</label>
              <input name="pesoPasillaMojada" type="number" step="0.1" placeholder="Ej. 5.5" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Café Seco (kg)</label>
              <input name="pesoCafeSeco" type="number" step="0.1" placeholder="Ej. 40.2" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Pasilla Seca (kg)</label>
              <input name="pesoPasillaSeca" type="number" step="0.1" placeholder="Ej. 2.1" />
            </div>
          </div>

          <button type="submit" className="primary" style={{ alignSelf: 'flex-end', minWidth: '200px' }} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Lote</th>
                <th>Cereza (kg)</th>
                <th>Mojado (kg)</th>
                <th>Seco (kg)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {procesos.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td>{p.lote.nombre}</td>
                  <td>{p.pesoCerezaProcesada}</td>
                  <td>{p.pesoCafeMojado || '-'}</td>
                  <td style={{ fontWeight: 'bold' }}>{p.pesoCafeSeco || '-'}</td>
                  <td className="actions-cell">
                    <button className="secondary" onClick={() => setEditingProceso(p)}>Editar</button>
                    <button className="danger" onClick={() => handleDelete(p.id)} disabled={isPending}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {procesos.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!editingProceso} onClose={() => setEditingProceso(null)} title="Editar Proceso Lavado">
        {editingProceso && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Fecha</label>
              <input name="fecha" type="date" required defaultValue={new Date(editingProceso.fecha).toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Lote</label>
              <select name="loteId" required defaultValue={editingProceso.loteId}>
                {lotes.map(l => (
                  <option key={l.id} value={l.id}>{l.nombre} — Disp: {l.disponible} kg</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cereza Procesada (kg)</label>
              <input name="pesoCerezaProcesada" type="number" step="0.1" required defaultValue={editingProceso.pesoCerezaProcesada} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Café Mojado (kg)</label>
                <input name="pesoCafeMojado" type="number" step="0.1" defaultValue={editingProceso.pesoCafeMojado || ''} />
              </div>
              <div className="form-group">
                <label>Pasilla Mojada (kg)</label>
                <input name="pesoPasillaMojada" type="number" step="0.1" defaultValue={editingProceso.pesoPasillaMojada || ''} />
              </div>
              <div className="form-group">
                <label>Café Seco (kg)</label>
                <input name="pesoCafeSeco" type="number" step="0.1" defaultValue={editingProceso.pesoCafeSeco || ''} />
              </div>
              <div className="form-group">
                <label>Pasilla Seca (kg)</label>
                <input name="pesoPasillaSeca" type="number" step="0.1" defaultValue={editingProceso.pesoPasillaSeca || ''} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="primary" style={{ flex: 1 }} disabled={isPending}>Actualizar</button>
              <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditingProceso(null)}>Cancelar</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
