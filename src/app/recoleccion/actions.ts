'use server'

import leonoraDb from '@/lib/leonora-core'
import { revalidatePath } from 'next/cache'

export async function getRecolecciones() {
  return await leonoraDb.recoleccion.findMany({
    orderBy: { fecha: 'desc' },
    include: {
      recolector: true,
      lote: true,
    }
  })
}

export async function getFormData() {
  const [recolectores, lotes] = await Promise.all([
    leonoraDb.recolector.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    leonoraDb.lote.findMany({ orderBy: { nombre: 'asc' } })
  ])
  return { recolectores, lotes }
}

export async function createRecoleccion(formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const recolectorId = formData.get('recolectorId') as string
  const loteId = formData.get('loteId') as string
  const pesoCereza = parseFloat(formData.get('pesoCereza') as string)
  
  if (!recolectorId || !loteId || isNaN(pesoCereza)) {
    return { error: 'Datos inválidos' }
  }
  
  await leonoraDb.recoleccion.create({
    data: {
      fecha,
      recolectorId,
      loteId,
      pesoCereza,
    }
  })
  
  revalidatePath('/recoleccion')
  return { success: true }
}

export async function updateRecoleccion(id: string, formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const recolectorId = formData.get('recolectorId') as string
  const loteId = formData.get('loteId') as string
  const pesoCereza = parseFloat(formData.get('pesoCereza') as string)

  if (!recolectorId || !loteId || isNaN(pesoCereza)) {
    return { error: 'Datos inválidos' }
  }

  await leonoraDb.recoleccion.update({
    where: { id },
    data: { fecha, recolectorId, loteId, pesoCereza }
  })

  revalidatePath('/recoleccion')
  return { success: true }
}

export async function deleteRecoleccion(id: string) {
  await leonoraDb.recoleccion.delete({ where: { id } })
  revalidatePath('/recoleccion')
}
