'use client';

import { useState, useTransition, useEffect } from 'react';
import { getProcesosFermentacion, getLotes, createProcesoFermentacion, deleteProcesoFermentacion, updateProcesoFermentacion } from './actions';
import Modal from '@/components/Modal';

type Proceso = Awaited<ReturnType<typeof getProcesosFermentacion>>[0];
type Lote = Awaited<ReturnType<typeof getLotes>>[0];

export default function ProcesoFermentacionPage() {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editingProceso, setEditingProceso] = useState<Proceso | null>(null);

  const loadData = async () => {
    const [p, l] = await Promise.all([getProcesosFermentacion(), getLotes()]);
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
      await createProcesoFermentacion(formData);
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
      await updateProcesoFermentacion(editingProceso.id, formData);
      setEditingProceso(null);
      await loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    startTransition(async () => {
      await deleteProcesoFermentacion(id);
      await loadData();
    });
  };

  return (
    <div>
      <h1 className="page-title">Proceso de Beneficio: Fermentación</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Registrar Lote Fermentado</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Fecha de Selección</label>
              <input name="fecha" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Lote de Origen (Cereza Disponible)</label>
              <select name="loteId" required>
                <option value="">Seleccione Lote</option>
                {lotes.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nombre} — {l.disponible} kg disp.
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Cereza Seleccionada</label>
              <input name="pesoCerezaTotal" type="number" step="0.1" required placeholder="Kg totales" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Días Fermentación</label>
              <input name="diasFermentacion" type="number" required placeholder="Ej: 5" defaultValue="5" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Café Seco Final (kg)</label>
              <input name="pesoCafeSeco" type="number" step="0.1" placeholder="Ej. 30.5" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Cereza de 2da / Flotes (kg)</label>
              <input name="pesoFlotesSegunda" type="number" step="0.1" placeholder="Ej. 10.0" />
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
                <th>Días</th>
                <th>Cereza (kg)</th>
                <th>Seco (kg)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {procesos.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td>{p.lote.nombre}</td>
                  <td>{p.diasFermentacion}</td>
                  <td>{p.pesoCerezaTotal}</td>
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

      <Modal isOpen={!!editingProceso} onClose={() => setEditingProceso(null)} title="Editar Proceso Fermentación">
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
                  <option key={l.id} value={l.id}>{l.nombre} — {l.disponible} kg disp.</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Cereza (kg)</label>
                <input name="pesoCerezaTotal" type="number" step="0.1" required defaultValue={editingProceso.pesoCerezaTotal} />
              </div>
              <div className="form-group">
                <label>Días Fermentación</label>
                <input name="diasFermentacion" type="number" required defaultValue={editingProceso.diasFermentacion} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Café Seco (kg)</label>
                <input name="pesoCafeSeco" type="number" step="0.1" defaultValue={editingProceso.pesoCafeSeco || ''} />
              </div>
              <div className="form-group">
                <label>Pasilla / Flotes (kg)</label>
                <input name="pesoFlotesSegunda" type="number" step="0.1" defaultValue={editingProceso.pesoFlotesSegunda || ''} />
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
