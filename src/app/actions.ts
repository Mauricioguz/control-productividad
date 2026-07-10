'use server'

import leonoraDb from '@/lib/leonora-core'

export async function getDashboardData() {
  console.log('--- Iniciando carga de datos del Dashboard ---')
  try {
    const [lotes, recolecciones, procesosLavado, procesosFermentacion, recolectores] = await Promise.all([
      leonoraDb.lote.findMany({ orderBy: { nombre: 'asc' } }).then(res => { console.log('✓ Lotes cargados'); return res; }),
      leonoraDb.recoleccion.findMany({ include: { lote: true, recolector: true } }).then(res => { console.log('✓ Recolecciones cargadas'); return res; }),
      leonoraDb.procesoLavado.findMany({ include: { lote: true } }).then(res => { console.log('✓ Procesos Lavado cargados'); return res; }),
      leonoraDb.procesoFermentacion.findMany({ include: { lote: true } }).then(res => { console.log('✓ Procesos Fermentacion cargados'); return res; }),
      leonoraDb.recolector.findMany({ where: { activo: true } }).then(res => { console.log('✓ Recolectores cargados'); return res; }),
    ])
    console.log('--- Todos los datos cargados exitosamente ---')

  // === KPIs Globales ===
  const totalCerezaRecolectada = recolecciones.reduce((s, r) => s + r.pesoCereza, 0)
  const totalSecoLavado = procesosLavado.reduce((s, p) => s + (p.pesoCafeSeco ?? 0), 0)
  const totalSecoFermentado = procesosFermentacion.reduce((s, p) => s + (p.pesoCafeSeco ?? 0), 0)
  const totalSeco = totalSecoLavado + totalSecoFermentado
  const totalTeoricoGlobal = lotes.reduce((s, l) => s + l.numeroArboles * l.rendimientoTeorico, 0)
  const totalCerezaProcesadaFinca = procesosLavado.reduce((s, p) => s + p.pesoCerezaProcesada, 0) + procesosFermentacion.reduce((s, p) => s + p.pesoCerezaTotal, 0)
  const rendimientoFincaReal = totalSeco > 0 ? (totalCerezaProcesadaFinca / totalSeco) * 12.5 : 0

  // === BI por Lote ===
  const loteBI = lotes.map(lote => {
    // Recolección de cereza en este lote
    const cerezaLote = recolecciones
      .filter(r => r.loteId === lote.id)
      .reduce((s, r) => s + r.pesoCereza, 0)

    // Proceso lavado en este lote
    const lavadoData = procesosLavado.filter(p => p.loteId === lote.id)
    const secoLavado = lavadoData.reduce((s, p) => s + (p.pesoCafeSeco ?? 0), 0)
    const mojadoLavado = lavadoData.reduce((s, p) => s + (p.pesoCafeMojado ?? 0), 0)
    const cerezaLavada = lavadoData.reduce((s, p) => s + p.pesoCerezaProcesada, 0)
    const pasillaMojada = lavadoData.reduce((s, p) => s + (p.pesoPasillaMojada ?? 0), 0)
    const pasillaSeca = lavadoData.reduce((s, p) => s + (p.pesoPasillaSeca ?? 0), 0)

    // Proceso fermentación en este lote
    const ferData = procesosFermentacion.filter(p => p.loteId === lote.id)
    const secoFermentado = ferData.reduce((s, p) => s + (p.pesoCafeSeco ?? 0), 0)
    const cerezaFermentada = ferData.reduce((s, p) => s + p.pesoCerezaTotal, 0)
    const flotesSegunda = ferData.reduce((s, p) => s + (p.pesoFlotesSegunda ?? 0), 0)

    const secoTotal = secoLavado + secoFermentado
    const cerezaTotalProcesada = cerezaLavada + cerezaFermentada
    const teoricoLote = lote.numeroArboles * lote.rendimientoTeorico
    const cumplimiento = teoricoLote > 0 ? (secoTotal / teoricoLote) * 100 : 0
    const cerezaPorArroba = secoTotal > 0 ? (cerezaTotalProcesada / secoTotal) * 12.5 : 0
    const pasillaPorArroba = secoTotal > 0 ? (pasillaSeca / secoTotal) * 12.5 : 0
    const segundasPorArroba = secoTotal > 0 ? (flotesSegunda / secoTotal) * 12.5 : 0

    // Rendimientos
    const rendCerezaMojado = cerezaLavada > 0 && mojadoLavado > 0
      ? ((mojadoLavado / cerezaLavada) * 100) : 0
    const rendMojadoSeco = mojadoLavado > 0 && secoLavado > 0
      ? ((secoLavado / mojadoLavado) * 100) : 0
    const rendCerezaSecoFer = cerezaFermentada > 0 && secoFermentado > 0
      ? ((secoFermentado / cerezaFermentada) * 100) : 0

    return {
      id: lote.id,
      nombre: lote.nombre,
      numeroArboles: lote.numeroArboles,
      cerezaRecolectada: cerezaLote,
      cerezaTotalProcesada,
      secoTotal,
      secoLavado,
      secoFermentado,
      mojadoLavado,
      pasillaMojada,
      pasillaSeca,
      flotesSegunda,
      teoricoLote,
      cumplimiento: parseFloat(cumplimiento.toFixed(1)),
      rendCerezaMojado: parseFloat(rendCerezaMojado.toFixed(1)),
      rendMojadoSeco: parseFloat(rendMojadoSeco.toFixed(1)),
      rendCerezaSecoFer: parseFloat(rendCerezaSecoFer.toFixed(1)),
      cerezaPorArroba: parseFloat(cerezaPorArroba.toFixed(1)),
      pasillaPorArroba: parseFloat(pasillaPorArroba.toFixed(1)),
      segundasPorArroba: parseFloat(segundasPorArroba.toFixed(1)),
    }
  })

  // === Recolección por Recolector ===
  const porRecolector = recolectores.map(r => {
    const total = recolecciones
      .filter(rc => rc.recolectorId === r.id)
      .reduce((s, rc) => s + rc.pesoCereza, 0)
    return { nombre: r.nombre, cereza: total }
  }).filter(r => r.cereza > 0)

  // === Evolución de Recolección por Mes ===
  const porMes: Record<string, number> = {}
  recolecciones.forEach(r => {
    const mes = new Date(r.fecha).toLocaleDateString('es', { month: 'short', year: 'numeric' })
    porMes[mes] = (porMes[mes] ?? 0) + r.pesoCereza
  })
  const evolucionMensual = Object.entries(porMes).map(([mes, cereza]) => ({ mes, cereza }))

    return {
      kpis: {
        totalCerezaRecolectada: parseFloat(totalCerezaRecolectada.toFixed(1)),
        totalSeco: parseFloat(totalSeco.toFixed(1)),
        totalTeoricoGlobal: parseFloat(totalTeoricoGlobal.toFixed(1)),
        cumplimientoGlobal: totalTeoricoGlobal > 0 ? parseFloat(((totalSeco / totalTeoricoGlobal) * 100).toFixed(1)) : 0,
        rendimientoFincaReal: parseFloat(rendimientoFincaReal.toFixed(1)),
        recolectoresActivos: recolectores.length,
        totalLotes: lotes.length,
      },
      loteBI,
      porRecolector,
      evolucionMensual,
    }
  } catch (error) {
    console.error('CRITICAL ERROR IN DASHBOARD ACTION:', error)
    throw error
  }
}
