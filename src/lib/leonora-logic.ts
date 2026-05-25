import leonoraDb from './leonora-core'

export async function getLotesConSaldo() {
  const [lotes, recolecciones, procesosLavado, procesosFermentacion] = await Promise.all([
    leonoraDb.lote.findMany({ orderBy: { nombre: 'asc' } }),
    leonoraDb.recoleccion.findMany(),
    leonoraDb.procesoLavado.findMany(),
    leonoraDb.procesoFermentacion.findMany()
  ])

  return lotes.map(lote => {
    const cosechado = recolecciones
      .filter(r => r.loteId === lote.id)
      .reduce((sum, r) => sum + r.pesoCereza, 0)
    
    const procesadoLavado = procesosLavado
      .filter(p => p.loteId === lote.id)
      .reduce((sum, p) => sum + p.pesoCerezaProcesada, 0)
    
    const procesadoFermentacion = procesosFermentacion
      .filter(p => p.loteId === lote.id)
      .reduce((sum, p) => sum + p.pesoCerezaTotal, 0)

    const disponible = cosechado - (procesadoLavado + procesadoFermentacion)

    return {
      ...lote,
      cosechado,
      procesado: procesadoLavado + procesadoFermentacion,
      disponible: Math.max(0, disponible)
    }
  })
}

export async function getBodegaStatus() {
  const [procesosLavado, procesosFermentacion, salidas] = await Promise.all([
    leonoraDb.procesoLavado.findMany(),
    leonoraDb.procesoFermentacion.findMany(),
    leonoraDb.salidaBodega.findMany()
  ])

  // Entradas Pergamino Seco
  const entradaSecoLavado = procesosLavado.reduce((s, p) => s + (p.pesoCafeSeco ?? 0), 0)
  const entradaSecoFermentado = procesosFermentacion.reduce((s, p) => s + (p.pesoCafeSeco ?? 0), 0)
  const totalEntradaSeco = entradaSecoLavado + entradaSecoFermentado

  // Entradas Pasilla
  const entradaPasillaLavado = procesosLavado.reduce((s, p) => s + (p.pesoPasillaSeca ?? 0), 0)
  const entradaPasillaFermentado = procesosFermentacion.reduce((s, p) => s + (p.pesoFlotesSegunda ?? 0), 0)
  const totalEntradaPasilla = entradaPasillaLavado + entradaPasillaFermentado

  // Salidas por Método (Lavado por defecto para registros antiguos que no tengan metodoBeneficio)
  const salidaSecoLavado = salidas
    .filter(s => s.tipo === 'PERGAMINO_SECO' && (s.metodoBeneficio === 'LAVADO' || !s.metodoBeneficio))
    .reduce((s, x) => s + x.cantidad, 0)
  const salidaSecoFermentado = salidas
    .filter(s => s.tipo === 'PERGAMINO_SECO' && s.metodoBeneficio === 'FERMENTADO')
    .reduce((s, x) => s + x.cantidad, 0)

  const salidaPasillaLavado = salidas
    .filter(s => s.tipo === 'PASILLA' && (s.metodoBeneficio === 'LAVADO' || !s.metodoBeneficio))
    .reduce((s, x) => s + x.cantidad, 0)
  const salidaPasillaFermentado = salidas
    .filter(s => s.tipo === 'PASILLA' && s.metodoBeneficio === 'FERMENTADO')
    .reduce((s, x) => s + x.cantidad, 0)

  const totalSalidaSeco = salidaSecoLavado + salidaSecoFermentado
  const totalSalidaPasilla = salidaPasillaLavado + salidaPasillaFermentado

  return {
    pergaminoSeco: totalEntradaSeco - totalSalidaSeco,
    pasilla: totalEntradaPasilla - totalSalidaPasilla,
    // Desglose de existencias por beneficio
    pergaminoSecoLavado: entradaSecoLavado - salidaSecoLavado,
    pergaminoSecoFermentado: entradaSecoFermentado - salidaSecoFermentado,
    pasillaLavado: entradaPasillaLavado - salidaPasillaLavado,
    pasillaFermentado: entradaPasillaFermentado - salidaPasillaFermentado,
    totales: {
      entradasSeco: totalEntradaSeco,
      salidasSeco: totalSalidaSeco,
      entradasPasilla: totalEntradaPasilla,
      salidasPasilla: totalSalidaPasilla,
      // Desglose para reporte
      entradasSecoLavado: entradaSecoLavado,
      salidasSecoLavado: salidaSecoLavado,
      entradasSecoFermentado: entradaSecoFermentado,
      salidasSecoFermentado: salidaSecoFermentado,
      entradasPasillaLavado: entradaPasillaLavado,
      salidasPasillaLavado: salidaPasillaLavado,
      entradasPasillaFermentado: entradaPasillaFermentado,
      salidasPasillaFermentado: salidaPasillaFermentado
    }
  }
}
