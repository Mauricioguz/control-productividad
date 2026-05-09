'use client';

import { useState, useTransition, useEffect } from 'react';
import { getLotes, createLote, deleteLote, updateLote } from './actions';
import Modal from '@/components/Modal';

type Lote = Awaited<ReturnType<typeof getLotes>>[0];

export default function LotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editingLote, setEditingLote] = useState<Lote | null>(null);

  const loadData = async () => {
    const data = await getLotes();
    setLotes(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    startTransition(async () => {
      await createLote(formData);
      form.reset();
      await loadData();
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLote) return;
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await updateLote(editingLote.id, formData);
      setEditingLote(null);
      await loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este lote?')) return;
    startTransition(async () => {
      await deleteLote(id);
      await loadData();
    });
  };

  return (
    <div>
      <h1 className="page-title">Gestión de Lotes</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Registrar Nuevo Lote</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Nombre / Número del Lote</label>
            <input name="nombre" type="text" required placeholder="Ej. Lote 1 - Caturra" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Número de Árboles</label>
            <input name="numeroArboles" type="number" required placeholder="5000" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Rendimiento Teórico (kg/árbol)</label>
            <input name="rendimientoTeorico" type="number" step="0.01" required placeholder="1.25" />
          </div>
          <button type="submit" className="primary" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Agregar Lote'}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Árboles</th>
              <th>Teórico</th>
              <th>Esperado (kg seco)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map(l => (
              <tr key={l.id}>
                <td>{l.nombre}</td>
                <td>{l.numeroArboles.toLocaleString()}</td>
                <td>{l.rendimientoTeorico} kg/árbol</td>
                <td style={{ fontWeight: 'bold' }}>{(l.numeroArboles * l.rendimientoTeorico).toLocaleString()} kg</td>
                <td className="actions-cell">
                  <button className="secondary" onClick={() => setEditingLote(l)}>Editar</button>
                  <button className="danger" onClick={() => handleDelete(l.id)} disabled={isPending}>Eliminar</button>
                </td>
              </tr>
            ))}
            {lotes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay lotes registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editingLote} onClose={() => setEditingLote(null)} title="Editar Lote">
        {editingLote && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre del Lote</label>
              <input name="nombre" type="text" required defaultValue={editingLote.nombre} />
            </div>
            <div className="form-group">
              <label>Número de Árboles</label>
              <input name="numeroArboles" type="number" required defaultValue={editingLote.numeroArboles} />
            </div>
            <div className="form-group">
              <label>Rendimiento Teórico (kg/árbol)</label>
              <input name="rendimientoTeorico" type="number" step="0.01" required defaultValue={editingLote.rendimientoTeorico} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="primary" style={{ flex: 1 }} disabled={isPending}>
                {isPending ? 'Guardando...' : 'Actualizar'}
              </button>
              <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditingLote(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
