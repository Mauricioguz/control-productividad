'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#4ade80', '#6366f1', '#f59e0b', '#ec4899', '#38bdf8'];

type LoteBI = {
  nombre: string;
  cerezaRecolectada: number;
  secoTotal: number;
  secoLavado: number;
  secoFermentado: number;
  teoricoLote: number;
  cumplimiento: number;
  rendCerezaMojado: number;
  rendMojadoSeco: number;
  rendCerezaSecoFer: number;
  pasillaMojada: number;
  pasillaSeca: number;
  flotesSegunda: number;
};

const tooltipStyle = {
  backgroundColor: '#1e2129',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
};

export function LotesComparisonChart({ data }: { data: LoteBI[] }) {
  const chartData = data.map(l => ({
    nombre: l.nombre.length > 12 ? l.nombre.slice(0, 12) + '…' : l.nombre,
    'Seco Real': l.secoTotal,
    'Teórico': l.teoricoLote,
    'Cereza': l.cerezaRecolectada,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="nombre" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" kg" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
        <Bar dataKey="Teórico" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Seco Real" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Cereza" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CumplimientoChart({ data }: { data: LoteBI[] }) {
  const chartData = data.map(l => ({
    nombre: l.nombre.length > 12 ? l.nombre.slice(0, 12) + '…' : l.nombre,
    'Cumplimiento %': l.cumplimiento,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
        <YAxis dataKey="nombre" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={90} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="Cumplimiento %" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry['Cumplimiento %'] >= 80 ? '#4ade80' : entry['Cumplimiento %'] >= 50 ? '#f59e0b' : '#ef4444'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RendimientosChart({ data }: { data: LoteBI[] }) {
  const chartData = data.filter(l => l.rendCerezaMojado > 0 || l.rendCerezaSecoFer > 0).map(l => ({
    nombre: l.nombre.length > 12 ? l.nombre.slice(0, 12) + '…' : l.nombre,
    'Cereza→Mojado': l.rendCerezaMojado,
    'Mojado→Seco': l.rendMojadoSeco,
    'Cereza→Seco (Fer.)': l.rendCerezaSecoFer,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="nombre" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
        <Bar dataKey="Cereza→Mojado" fill="#38bdf8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Mojado→Seco" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Cereza→Seco (Fer.)" fill="#ec4899" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PasillasChart({ data }: { data: LoteBI[] }) {
  const chartData = data.filter(l => l.pasillaMojada > 0 || l.pasillaSeca > 0 || l.flotesSegunda > 0).map(l => ({
    nombre: l.nombre.length > 12 ? l.nombre.slice(0, 12) + '…' : l.nombre,
    'Pasilla Mojada': l.pasillaMojada,
    'Pasilla Seca': l.pasillaSeca,
    'Café Segunda': l.flotesSegunda,
  }));

  if (chartData.length === 0) return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Sin datos de pasillas aún
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="nombre" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" kg" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
        <Bar dataKey="Pasilla Mojada" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Pasilla Seca" fill="#fb923c" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Café Segunda" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EvolucionChart({ data }: { data: { mes: string; cereza: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" kg" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
        <Line
          type="monotone"
          dataKey="cereza"
          name="Cereza Recolectada"
          stroke="#4ade80"
          strokeWidth={2}
          dot={{ fill: '#4ade80', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProduccionPieChart({ data }: { data: LoteBI[] }) {
  const pieData = data.filter(l => l.secoTotal > 0).map(l => ({
    name: l.nombre,
    value: l.secoTotal,
  }));

  if (pieData.length === 0) return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Sin producción seca registrada aún
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v} kg`} />
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RadarRendimientosChart({ data }: { data: LoteBI[] }) {
  const radarData = [
    { metric: 'Cereza→Mojado', ...Object.fromEntries(data.map(l => [l.nombre.slice(0, 10), l.rendCerezaMojado])) },
    { metric: 'Mojado→Seco', ...Object.fromEntries(data.map(l => [l.nombre.slice(0, 10), l.rendMojadoSeco])) },
    { metric: 'Cumplimiento', ...Object.fromEntries(data.map(l => [l.nombre.slice(0, 10), l.cumplimiento])) },
    { metric: 'Rend.Fer.', ...Object.fromEntries(data.map(l => [l.nombre.slice(0, 10), l.rendCerezaSecoFer])) },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        {data.slice(0, 5).map((l, i) => (
          <Radar
            key={l.nombre}
            name={l.nombre}
            dataKey={l.nombre.slice(0, 10)}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.15}
          />
        ))}
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
