'use client';

import { useState, useTransition, useEffect } from 'react';
import { getRecolecciones, getFormData, createRecoleccion, deleteRecoleccion, updateRecoleccion } from './actions';
import Modal from '@/components/Modal';

type Recoleccion = Awaited<ReturnType<typeof getRecolecciones>>[0];
type FormDataDeps = Awaited<ReturnType<typeof getFormData>>;

export default function RecoleccionPage() {
  const [recolecciones, setRecolecciones] = useState<Recoleccion[]>([]);
  const [deps, setDeps] = useState<FormDataDeps>({ recolectores: [], lotes: [] });
  const [isPending, startTransition] = useTransition();
  const [editingRecoleccion, setEditingRecoleccion] = useState<Recoleccion | null>(null);

  const loadData = async () => {
    const [recolData, formDeps] = await Promise.all([
      getRecolecciones(),
      getFormData()
    ]);
    setRecolecciones(recolData);
    setDeps(formDeps);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    startTransition(async () => {
      await createRecoleccion(formData);
      form.reset();
      const fechaInput = form.elements.namedItem('fecha') as HTMLInputElement | null;
      if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];
      await loadData();
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRecoleccion) return;
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await updateRecoleccion(editingRecoleccion.id, formData);
      setEditingRecoleccion(null);
      await loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    startTransition(async () => {
      await deleteRecoleccion(id);
      await loadData();
    });
  };

  return (
    <div>
      <h1 className="page-title">Recolección Diaria de Cereza</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Registrar Recolección</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 2fr 2fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Fecha</label>
            <input name="fecha" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Recolector</label>
            <select name="recolectorId" required>
              <option value="">Seleccione Recolector</option>
              {deps.recolectores.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Lote</label>
            <select name="loteId" required>
              <option value="">Seleccione Lote</option>
              {deps.lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Cereza (kg)</label>
            <input name="pesoCereza" type="number" step="0.1" required placeholder="0.0" />
          </div>
          <button type="submit" className="primary" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Recolector</th>
              <th>Lote</th>
              <th>Cereza Recolectada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recolecciones.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.fecha).toLocaleDateString()}</td>
                <td>{r.recolector.nombre}</td>
                <td>{r.lote.nombre}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{r.pesoCereza} kg</td>
                <td className="actions-cell">
                  <button className="secondary" onClick={() => setEditingRecoleccion(r)}>Editar</button>
                  <button className="danger" onClick={() => handleDelete(r.id)} disabled={isPending}>Eliminar</button>
                </td>
              </tr>
            ))}
            {recolecciones.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay recolecciones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editingRecoleccion} onClose={() => setEditingRecoleccion(null)} title="Editar Recolección">
        {editingRecoleccion && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Fecha</label>
              <input name="fecha" type="date" required defaultValue={new Date(editingRecoleccion.fecha).toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Recolector</label>
              <select name="recolectorId" required defaultValue={editingRecoleccion.recolectorId}>
                {deps.recolectores.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Lote</label>
              <select name="loteId" required defaultValue={editingRecoleccion.loteId}>
                {deps.lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cereza (kg)</label>
              <input name="pesoCereza" type="number" step="0.1" required defaultValue={editingRecoleccion.pesoCereza} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="primary" style={{ flex: 1 }} disabled={isPending}>
                {isPending ? 'Guardando...' : 'Actualizar'}
              </button>
              <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditingRecoleccion(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
