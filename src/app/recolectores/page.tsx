'use client';

import { useState, useTransition, useEffect } from 'react';
import { getRecolectores, createRecolector, deleteRecolector, toggleActivo, updateRecolector } from './actions';
import Modal from '@/components/Modal';

type Recolector = Awaited<ReturnType<typeof getRecolectores>>[0];

export default function RecolectoresPage() {
  const [recolectores, setRecolectores] = useState<Recolector[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editingRecolector, setEditingRecolector] = useState<Recolector | null>(null);

  const loadData = async () => {
    const data = await getRecolectores();
    setRecolectores(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    startTransition(async () => {
      await createRecolector(formData);
      form.reset();
      await loadData();
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRecolector) return;
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await updateRecolector(editingRecolector.id, formData);
      setEditingRecolector(null);
      await loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar recolector?')) return;
    startTransition(async () => {
      await deleteRecolector(id);
      await loadData();
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleActivo(id, current);
      await loadData();
    });
  };

  return (
    <div>
      <h1 className="page-title">Gestión de Recolectores</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Nuevo Recolector</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label>Nombre Completo</label>
            <input name="nombre" type="text" required placeholder="Ej. Juan Pérez" />
          </div>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label>Documento (Opcional)</label>
            <input name="documento" type="text" placeholder="12345678" />
          </div>
          <button type="submit" className="primary" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Agregar'}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recolectores.map(r => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.documento || '-'}</td>
                <td>
                  <button 
                    onClick={() => handleToggle(r.id, r.activo)}
                    style={{ background: r.activo ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: r.activo ? '#4ade80' : '#ef4444' }}
                  >
                    {r.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="actions-cell">
                  <button className="secondary" onClick={() => setEditingRecolector(r)}>Editar</button>
                  <button className="danger" onClick={() => handleDelete(r.id)} disabled={isPending}>Eliminar</button>
                </td>
              </tr>
            ))}
            {recolectores.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No hay recolectores registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editingRecolector} onClose={() => setEditingRecolector(null)} title="Editar Recolector">
        {editingRecolector && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input name="nombre" type="text" required defaultValue={editingRecolector.nombre} />
            </div>
            <div className="form-group">
              <label>Documento</label>
              <input name="documento" type="text" defaultValue={editingRecolector.documento || ''} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="primary" style={{ flex: 1 }} disabled={isPending}>
                {isPending ? 'Guardando...' : 'Actualizar'}
              </button>
              <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditingRecolector(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
