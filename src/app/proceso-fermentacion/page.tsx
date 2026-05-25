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

  const [regPesoCerezaTotal, setRegPesoCerezaTotal] = useState<string>('');
  const [regPesoCerezaSeleccionada, setRegPesoCerezaSeleccionada] = useState<string>('');

  const [editPesoTotal, setEditPesoTotal] = useState<string>('');
  const [editPesoSeleccionada, setEditPesoSeleccionada] = useState<string>('');

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
      setRegPesoCerezaTotal('');
      setRegPesoCerezaSeleccionada('');
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
      setEditPesoTotal('');
      setEditPesoSeleccionada('');
      await loadData();
    });
  };

  const handleEditClick = (p: Proceso) => {
    setEditingProceso(p);
    setEditPesoTotal(p.pesoCerezaTotal.toString());
    setEditPesoSeleccionada(p.pesoCerezaSeleccionada?.toString() ?? '');
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 2fr 1fr 1fr 1fr', gap: '1rem' }}>
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
              <label>Cereza Seleccionada del Lote</label>
              <input 
                name="pesoCerezaTotal" 
                type="number" 
                step="0.1" 
                required 
                placeholder="Kg totales" 
                value={regPesoCerezaTotal}
                onChange={(e) => setRegPesoCerezaTotal(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Cereza Excelsa Obtenida</label>
              <input 
                name="pesoCerezaSeleccionada" 
                type="number" 
                step="0.1" 
                required 
                placeholder="Kg excelsa" 
                value={regPesoCerezaSeleccionada}
                onChange={(e) => setRegPesoCerezaSeleccionada(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Días Fermentación</label>
              <input name="diasFermentacion" type="number" required placeholder="Ej: 5" defaultValue="5" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Café de Segunda (Diferencia)</label>
              <input 
                type="text" 
                readOnly 
                disabled
                value={`${(parseFloat(regPesoCerezaTotal) && parseFloat(regPesoCerezaSeleccionada)) ? Math.max(0, parseFloat(regPesoCerezaTotal) - parseFloat(regPesoCerezaSeleccionada)).toFixed(1) : '0.0'} kg`} 
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Café Seco 1ra Final (kg)</label>
              <input name="pesoCafeSeco" type="number" step="0.1" placeholder="Ej. 30.5" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Café Seco 2da Final (kg)</label>
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
                <th>Cereza Total</th>
                <th>Cereza 1ra</th>
                <th>Cereza 2da (Dif)</th>
                <th>Seco 1ra (kg)</th>
                <th>Seco 2da (kg)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {procesos.map(p => {
                const cerezaSegunda = p.pesoCerezaSeleccionada ? Math.max(0, p.pesoCerezaTotal - p.pesoCerezaSeleccionada) : 0;
                return (
                  <tr key={p.id}>
                    <td>{new Date(p.fecha).toLocaleDateString()}</td>
                    <td>{p.lote.nombre}</td>
                    <td>{p.diasFermentacion}</td>
                    <td>{p.pesoCerezaTotal} kg</td>
                    <td>{p.pesoCerezaSeleccionada ? `${p.pesoCerezaSeleccionada} kg` : '-'}</td>
                    <td>{p.pesoCerezaSeleccionada ? `${cerezaSegunda.toFixed(1)} kg` : '-'}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.pesoCafeSeco ? `${p.pesoCafeSeco} kg` : '-'}</td>
                    <td style={{ fontWeight: 'bold', color: '#f59e0b' }}>{p.pesoFlotesSegunda ? `${p.pesoFlotesSegunda} kg` : '-'}</td>
                    <td className="actions-cell">
                      <button className="secondary" onClick={() => handleEditClick(p)}>Editar</button>
                      <button className="danger" onClick={() => handleDelete(p.id)} disabled={isPending}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
              {procesos.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros.</td></tr>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Cereza Seleccionada del Lote</label>
                <input 
                  name="pesoCerezaTotal" 
                  type="number" 
                  step="0.1" 
                  required 
                  value={editPesoTotal} 
                  onChange={(e) => setEditPesoTotal(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Cereza Excelsa Obtenida</label>
                <input 
                  name="pesoCerezaSeleccionada" 
                  type="number" 
                  step="0.1" 
                  required 
                  value={editPesoSeleccionada} 
                  onChange={(e) => setEditPesoSeleccionada(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Café de Segunda (Diferencia)</label>
                <input 
                  type="text" 
                  readOnly 
                  disabled
                  value={`${(parseFloat(editPesoTotal) && parseFloat(editPesoSeleccionada)) ? Math.max(0, parseFloat(editPesoTotal) - parseFloat(editPesoSeleccionada)).toFixed(1) : '0.0'} kg`} 
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Días Fermentación</label>
                <input name="diasFermentacion" type="number" required defaultValue={editingProceso.diasFermentacion} />
              </div>
              <div className="form-group">
                <label>Café Seco 1ra (kg)</label>
                <input name="pesoCafeSeco" type="number" step="0.1" defaultValue={editingProceso.pesoCafeSeco || ''} />
              </div>
              <div className="form-group">
                <label>Café Seco 2da (kg)</label>
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
