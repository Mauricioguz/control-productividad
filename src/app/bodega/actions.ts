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
  const destino = formData.get('destino') as string
  const notas = formData.get('notas') as string

  if (isNaN(cantidad) || !tipo || !destino) {
    return { error: 'Datos inválidos' }
  }

  await leonoraDb.salidaBodega.create({
    data: {
      fecha,
      cantidad,
      tipo,
      destino,
      notas: notas || null
    }
  })

  revalidatePath('/bodega')
  return { success: true }
}

export async function updateSalida(id: string, formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const cantidad = parseFloat(formData.get('cantidad') as string)
  const tipo = formData.get('tipo') as string
  const destino = formData.get('destino') as string
  const notas = formData.get('notas') as string

  if (isNaN(cantidad) || !tipo || !destino) {
    return { error: 'Datos inválidos' }
  }

  await leonoraDb.salidaBodega.update({
    where: { id },
    data: {
      fecha,
      cantidad,
      tipo,
      destino,
      notas: notas || null
    }
  })

  revalidatePath('/bodega')
  return { success: true }
}

export async function deleteSalida(id: string) {
  await leonoraDb.salidaBodega.delete({ where: { id } })
  revalidatePath('/bodega')
}
