'use server'

import leonoraDb from '@/lib/leonora-core'
import { revalidatePath } from 'next/cache'

export async function getRecolectores() {
  return await leonoraDb.recolector.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createRecolector(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const documento = formData.get('documento') as string
  
  if (!nombre) return { error: 'Nombre es requerido' }
  
  await leonoraDb.recolector.create({
    data: {
      nombre,
      documento: documento || null,
    }
  })
  
  revalidatePath('/recolectores')
  return { success: true }
}

export async function updateRecolector(id: string, formData: FormData) {
  const nombre = formData.get('nombre') as string
  const documento = formData.get('documento') as string

  if (!nombre) return { error: 'Nombre es requerido' }

  await leonoraDb.recolector.update({
    where: { id },
    data: {
      nombre,
      documento: documento || null,
    }
  })

  revalidatePath('/recolectores')
  return { success: true }
}

export async function deleteRecolector(id: string) {
  await leonoraDb.recolector.delete({
    where: { id }
  })
  revalidatePath('/recolectores')
}

export async function toggleActivo(id: string, activo: boolean) {
  await leonoraDb.recolector.update({
    where: { id },
    data: { activo: !activo }
  })
  revalidatePath('/recolectores')
}
