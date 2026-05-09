'use server'

import leonoraDb from '@/lib/leonora-core'
import { revalidatePath } from 'next/cache'

export async function getLotes() {
  return await leonoraDb.lote.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createLote(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const numeroArboles = parseInt(formData.get('numeroArboles') as string)
  const rendimientoTeorico = parseFloat(formData.get('rendimientoTeorico') as string)
  
  if (!nombre || isNaN(numeroArboles) || isNaN(rendimientoTeorico)) {
    return { error: 'Datos inválidos' }
  }
  
  await leonoraDb.lote.create({
    data: {
      nombre,
      numeroArboles,
      rendimientoTeorico,
    }
  })
  
  revalidatePath('/lotes')
  return { success: true }
}

export async function updateLote(id: string, formData: FormData) {
  const nombre = formData.get('nombre') as string
  const numeroArboles = parseInt(formData.get('numeroArboles') as string)
  const rendimientoTeorico = parseFloat(formData.get('rendimientoTeorico') as string)

  if (!nombre || isNaN(numeroArboles) || isNaN(rendimientoTeorico)) {
    return { error: 'Datos inválidos' }
  }

  await leonoraDb.lote.update({
    where: { id },
    data: { nombre, numeroArboles, rendimientoTeorico }
  })

  revalidatePath('/lotes')
  return { success: true }
}

export async function deleteLote(id: string) {
  await leonoraDb.lote.delete({
    where: { id }
  })
  revalidatePath('/lotes')
}
