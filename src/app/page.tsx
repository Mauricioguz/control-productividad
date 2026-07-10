'use client';

import { useState, useEffect } from 'react';
import { getDashboardData } from './actions';
import {
  LotesComparisonChart,
  CumplimientoChart,
  RendimientosChart,
  PasillasChart,
  EvolucionChart,
  ProduccionPieChart,
  RadarRendimientosChart,
} from '@/components/Charts';

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

function KpiCard({ title, value, unit, color, footer }: { title: string; value: string | number; unit?: string; color?: string; footer?: string }) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </span>
      <span style={{ fontSize: '2rem', fontWeight: 800, color: color ?? 'var(--primary)' }}>
        {value}<span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: '4px', color: 'var(--text-muted)' }}>{unit}</span>
      </span>
      {footer && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{footer}</span>}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedLoteIndex, setSelectedLoteIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const d = await getDashboardData();
    setData(d);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Cargando Business Intelligence...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, loteBI, porRecolector, evolucionMensual } = data;
  const selectedLote = selectedLoteIndex !== null ? loteBI[selectedLoteIndex] : null;

  const cumplColor = kpis.cumplimientoGlobal >= 80 ? '#4ade80' : kpis.cumplimientoGlobal >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Business Intelligence</h1>
          <p style={{ color: 'var(--text-muted)' }}>Control de Productividad — Finca La Leonora ☕</p>
        </div>
        <button onClick={loadData} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          🔄 Actualizar
        </button>
      </div>

      {/* KPIs Globales */}
      <div>
        <SectionTitle title="Indicadores Globales" subtitle="Resumen de toda la finca" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
          <KpiCard title="Cereza Recolectada" value={kpis.totalCerezaRecolectada.toLocaleString()} unit="kg" />
          <KpiCard title="Pergamino Seco Total" value={kpis.totalSeco.toLocaleString()} unit="kg" color="#38bdf8" />
          <KpiCard title="Rendimiento Finca" value={kpis.rendimientoFincaReal > 0 ? kpis.rendimientoFincaReal.toLocaleString() : '—'} unit=" kg" color="#eab308" footer="cereza / @ seco (Teórico: 60)" />
          <KpiCard title="Potencial Teórico" value={kpis.totalTeoricoGlobal.toLocaleString()} unit="kg" color="#6366f1" />
          <KpiCard title="Cumplimiento Global" value={kpis.cumplimientoGlobal} unit="%" color={cumplColor} />
          <KpiCard title="Recolectores Activos" value={kpis.recolectoresActivos} color="#ec4899" />
          <KpiCard title="Lotes Registrados" value={kpis.totalLotes} color="#f59e0b" />
        </div>
      </div>

      {/* Gráfico comparativo principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <SectionTitle title="Producción Real vs. Teórica por Lote" subtitle="Cereza recolectada | Pergamino seco real | Meta teórica" />
          {loteBI.length > 0 ? <LotesComparisonChart data={loteBI} /> : <EmptyChart />}
        </div>
        <div className="glass-card">
          <SectionTitle title="% Cumplimiento por Lote" subtitle="Verde ≥80% | Amarillo ≥50% | Rojo &lt;50%" />
          {loteBI.length > 0 ? <CumplimientoChart data={loteBI} /> : <EmptyChart />}
        </div>
      </div>

      {/* Evolución y Distribución */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <SectionTitle title="Evolución Mensual de Recolección" subtitle="Kg de cereza acumulados por mes" />
          {evolucionMensual.length > 0 ? <EvolucionChart data={evolucionMensual} /> : <EmptyChart />}
        </div>
        <div className="glass-card">
          <SectionTitle title="Distribución de Seco por Lote" subtitle="Participación en producción total" />
          {loteBI.some(l => l.secoTotal > 0) ? <ProduccionPieChart data={loteBI} /> : <EmptyChart />}
        </div>
      </div>

      {/* Rendimientos y Pasillas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <SectionTitle title="Rendimiento de Conversión por Lote" subtitle="Kg de cereza necesarios para obtener 1 arroba (12.5 kg) de café seco" />
          {loteBI.some(l => l.secoTotal > 0 && l.cerezaTotalProcesada > 0) ? <RendimientosChart data={loteBI} /> : <EmptyChart />}
        </div>
        <div className="glass-card">
          <SectionTitle title="Control de Pasillas y Café de Segunda" subtitle="Subproductos por lote" />
          <PasillasChart data={loteBI} />
        </div>
      </div>

      {/* Radar Multi-indicador */}
      {loteBI.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-card">
            <SectionTitle title="Radar de Rendimientos" subtitle="Comparativa multidimensional por lote" />
            <RadarRendimientosChart data={loteBI} />
          </div>
          <div className="glass-card">
            <SectionTitle title="Recolección por Trabajador" subtitle="Kg totales de cereza aportados" />
            {porRecolector.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
                {porRecolector.sort((a, b) => b.cereza - a.cereza).map(r => {
                  const max = Math.max(...porRecolector.map(x => x.cereza));
                  const pct = max > 0 ? (r.cereza / max) * 100 : 0;
                  return (
                    <div key={r.nombre}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.875rem' }}>{r.nombre}</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.cereza.toLocaleString()} kg</span>
                      </div>
                      <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyChart />}
          </div>
        </div>
      )}

      {/* Detalle por Lote */}
      {loteBI.length > 0 && (
        <div className="glass-card">
          <SectionTitle title="Análisis Detallado por Lote" subtitle="Selecciona un lote para ver sus indicadores específicos" />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {loteBI.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setSelectedLoteIndex(selectedLoteIndex === i ? null : i)}
                style={{
                  background: selectedLoteIndex === i ? 'var(--primary)' : 'var(--surface)',
                  color: selectedLoteIndex === i ? '#000' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  padding: '0.5rem 1rem',
                  fontWeight: selectedLoteIndex === i ? 700 : 400,
                }}
              >
                {l.nombre}
              </button>
            ))}
          </div>

          {selectedLote && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* KPIs del lote */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <DetailCard label="Número de Árboles" value={selectedLote.numeroArboles.toLocaleString()} />
                <DetailCard label="Cereza Recolectada" value={`${selectedLote.cerezaRecolectada.toLocaleString()} kg`} />
                <DetailCard label="Seco Lavado" value={`${selectedLote.secoLavado.toLocaleString()} kg`} color="#4ade80" />
                <DetailCard label="Seco Fermentado" value={`${selectedLote.secoFermentado.toLocaleString()} kg`} color="#ec4899" />
                <DetailCard label="Total Pergamino Seco" value={`${selectedLote.secoTotal.toLocaleString()} kg`} color="#38bdf8" />
                <DetailCard label="Meta Teórica" value={`${selectedLote.teoricoLote.toLocaleString()} kg`} color="#6366f1" />
              </div>

              {/* Rendimientos del lote */}
              <RendimientoKilosBar realValue={selectedLote.cerezaPorArroba} />

              {/* Cumplimiento visual */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Cumplimiento vs. Meta</span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: cumplColorFor(selectedLote.cumplimiento) }}>
                    {selectedLote.cumplimiento}%
                  </span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: '8px', height: '16px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(selectedLote.cumplimiento, 100)}%`,
                    height: '100%',
                    background: cumplColorFor(selectedLote.cumplimiento),
                    borderRadius: '8px',
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>

              {/* Pasillas */}
              {(selectedLote.pasillaMojada > 0 || selectedLote.pasillaSeca > 0 || selectedLote.flotesSegunda > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <DetailCard label="Pasilla Mojada" value={`${selectedLote.pasillaMojada} kg`} color="#f59e0b" />
                  <DetailCard label="Pasilla Seca" value={`${selectedLote.pasillaSeca} kg`} color="#fb923c" />
                  <DetailCard label="Café Segunda (Flotes)" value={`${selectedLote.flotesSegunda} kg`} color="#6366f1" />
                </div>
              )}
            </div>
          )}

          {!selectedLote && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              Selecciona un lote para ver su análisis detallado
            </p>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {loteBI.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Sin datos todavía</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Comienza registrando Recolectores, Lotes y la primera Recolección de Cereza.
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '2rem' }}>📊</span>
      <span>Sin datos suficientes aún</span>
    </div>
  );
}

function DetailCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${color ?? 'var(--border)'}` }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: color ?? 'var(--text-main)' }}>{value}</div>
    </div>
  );
}

function RendimientoBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 800, color }}>{value > 0 ? `${value}%` : '—'}</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, transition: 'width 0.6s ease', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

function RendimientoKilosBar({ realValue }: { realValue: number }) {
  if (!realValue || realValue === 0) {
    return (
      <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Sin datos de rendimiento para este lote (requiere procesos con peso seco y cereza)
      </div>
    );
  }

  return (
    <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
        Rendimiento de Conversión (Cereza necesaria para obtener 1 Arroba de Café Seco)
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Real */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rendimiento Real</span>
            <span style={{ fontWeight: 800, color: realValue <= 60 ? '#4ade80' : '#f59e0b' }}>
              {realValue.toLocaleString()} kg cereza / @
            </span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((realValue / 120) * 100, 100)}%`, height: '100%', background: realValue <= 60 ? '#4ade80' : '#f59e0b', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Teórico */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rendimiento Teórico</span>
            <span style={{ fontWeight: 800, color: '#6366f1' }}>
              60 kg cereza / @
            </span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${(60 / 120) * 100}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        {realValue <= 60 
          ? `¡Eficiente! Necesitaste ${(60 - realValue).toFixed(1)} kg menos de cereza que el promedio teórico para producir una arroba.`
          : `Requiere ${(realValue - 60).toFixed(1)} kg más de cereza que el promedio teórico para producir una arroba.`}
      </div>
    </div>
  );
}

function cumplColorFor(value: number) {
  return value >= 80 ? '#4ade80' : value >= 50 ? '#f59e0b' : '#ef4444';
}
