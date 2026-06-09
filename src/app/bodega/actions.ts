'use server'

import leonoraDb from '@/lib/leonora-core'
import { revalidatePath } from 'next/cache'
import { getBodegaStatus as getStatus } from '@/lib/leonora-logic'

export async function getSalidas() {
  return await leonoraDb.salidaBodega.findMany({
    orderBy: { fecha: 'desc' }
  })
}

export async function getBodegaStatus() {
  return await getStatus()
}

export async function createSalida(formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const cantidad = parseFloat(formData.get('cantidad') as string)
  const tipo = formData.get('tipo') as string
  const metodoBeneficio = formData.get('metodoBeneficio') as string
  const destino = formData.get('destino') as string
  const notas = formData.get('notas') as string

  if (isNaN(cantidad) || cantidad <= 0 || !tipo || !destino) {
    return { error: 'Datos inválidos. La cantidad debe ser mayor a 0.' }
  }

  try {
    const status = await getStatus()
    let disponible = 0
    if (tipo === 'PERGAMINO_SECO') {
      disponible = metodoBeneficio === 'FERMENTADO' ? status.pergaminoSecoFermentado : status.pergaminoSecoLavado
    } else if (tipo === 'SEGUNDAS' || (tipo === 'PASILLA' && metodoBeneficio === 'FERMENTADO')) {
      disponible = status.pasillaFermentado
    } else {
      disponible = status.pasillaLavado
    }

    if (cantidad > disponible) {
      return {
        error: `No hay suficiente inventario disponible para realizar esta salida. Inventario disponible: ${disponible.toLocaleString()} kg.`
      }
    }

    await leonoraDb.salidaBodega.create({
      data: {
        fecha,
        cantidad,
        tipo,
        metodoBeneficio: metodoBeneficio || null,
        destino,
        notas: notas || null
      }
    })

    revalidatePath('/bodega')
    return { success: true }
  } catch (error: any) {
    console.error('Error al registrar salida:', error)
    return { error: `Error en el servidor: ${error.message}` }
  }
}

export async function updateSalida(id: string, formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const cantidad = parseFloat(formData.get('cantidad') as string)
  const tipo = formData.get('tipo') as string
  const metodoBeneficio = formData.get('metodoBeneficio') as string
  const destino = formData.get('destino') as string
  const notas = formData.get('notas') as string

  if (isNaN(cantidad) || cantidad <= 0 || !tipo || !destino) {
    return { error: 'Datos inválidos. La cantidad debe ser mayor a 0.' }
  }

  try {
    const existing = await leonoraDb.salidaBodega.findUnique({ where: { id } })
    if (!existing) {
      return { error: 'El registro a editar no existe.' }
    }

    const status = await getStatus()
    let disponibleTarget = 0
    if (tipo === 'PERGAMINO_SECO') {
      disponibleTarget = metodoBeneficio === 'FERMENTADO' ? status.pergaminoSecoFermentado : status.pergaminoSecoLavado
    } else if (tipo === 'SEGUNDAS' || (tipo === 'PASILLA' && metodoBeneficio === 'FERMENTADO')) {
      disponibleTarget = status.pasillaFermentado
    } else {
      disponibleTarget = status.pasillaLavado
    }

    // Comprobar si la salida anterior pertenecía a la misma categoría física
    const wasSameCategory = 
      (existing.tipo === tipo && existing.metodoBeneficio === metodoBeneficio) ||
      (
        (existing.tipo === 'SEGUNDAS' || (existing.tipo === 'PASILLA' && existing.metodoBeneficio === 'FERMENTADO')) &&
        (tipo === 'SEGUNDAS' || (tipo === 'PASILLA' && metodoBeneficio === 'FERMENTADO'))
      ) ||
      (
        (existing.tipo === 'PASILLA' && (existing.metodoBeneficio === 'LAVADO' || !existing.metodoBeneficio)) &&
        (tipo === 'PASILLA' && (metodoBeneficio === 'LAVADO' || !metodoBeneficio))
      ) ||
      (
        (existing.tipo === 'PERGAMINO_SECO' && (existing.metodoBeneficio === 'LAVADO' || !existing.metodoBeneficio)) &&
        (tipo === 'PERGAMINO_SECO' && (metodoBeneficio === 'LAVADO' || !metodoBeneficio))
      )

    if (wasSameCategory) {
      disponibleTarget += existing.cantidad
    }

    if (cantidad > disponibleTarget) {
      return {
        error: `No hay suficiente inventario disponible para realizar esta salida. Inventario disponible: ${disponibleTarget.toLocaleString()} kg.`
      }
    }

    await leonoraDb.salidaBodega.update({
      where: { id },
      data: {
        fecha,
        cantidad,
        tipo,
        metodoBeneficio: metodoBeneficio || null,
        destino,
        notas: notas || null
      }
    })

    revalidatePath('/bodega')
    return { success: true }
  } catch (error: any) {
    console.error('Error al actualizar salida:', error)
    return { error: `Error en el servidor: ${error.message}` }
  }
}

export async function deleteSalida(id: string) {
  try {
    await leonoraDb.salidaBodega.delete({ where: { id } })
    revalidatePath('/bodega')
    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar salida:', error)
    return { error: `Error en el servidor: ${error.message}` }
  }
}
