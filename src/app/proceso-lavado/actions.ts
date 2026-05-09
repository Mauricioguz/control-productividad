'use server'

import leonoraDb from '@/lib/leonora-core'
import { revalidatePath } from 'next/cache'
import { getLotesConSaldo } from '@/lib/leonora-logic'

export async function getProcesosLavado() {
  return await leonoraDb.procesoLavado.findMany({
    orderBy: { fecha: 'desc' },
    include: { lote: true }
  })
}

export async function getLotes() {
  return await getLotesConSaldo()
}

export async function createProcesoLavado(formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const loteId = formData.get('loteId') as string
  const pesoCerezaProcesada = parseFloat(formData.get('pesoCerezaProcesada') as string)
  
  const readFloat = (val: string | null) => val && !isNaN(parseFloat(val)) ? parseFloat(val) : null;
  const pesoCafeMojado = readFloat(formData.get('pesoCafeMojado') as string | null);
  const pesoPasillaMojada = readFloat(formData.get('pesoPasillaMojada') as string | null);
  const pesoCafeSeco = readFloat(formData.get('pesoCafeSeco') as string | null);
  const pesoPasillaSeca = readFloat(formData.get('pesoPasillaSeca') as string | null);

  if (!loteId || isNaN(pesoCerezaProcesada)) {
    return { error: 'Datos inválidos' }
  }
  
  await leonoraDb.procesoLavado.create({
    data: {
      fecha,
      loteId,
      pesoCerezaProcesada,
      pesoCafeMojado,
      pesoPasillaMojada,
      pesoCafeSeco,
      pesoPasillaSeca,
    }
  })
  
  revalidatePath('/proceso-lavado')
  return { success: true }
}

export async function updateProcesoLavado(id: string, formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const loteId = formData.get('loteId') as string
  const pesoCerezaProcesada = parseFloat(formData.get('pesoCerezaProcesada') as string)

  const readFloat = (val: string | null) => val && !isNaN(parseFloat(val)) ? parseFloat(val) : null;
  const pesoCafeMojado = readFloat(formData.get('pesoCafeMojado') as string | null);
  const pesoPasillaMojada = readFloat(formData.get('pesoPasillaMojada') as string | null);
  const pesoCafeSeco = readFloat(formData.get('pesoCafeSeco') as string | null);
  const pesoPasillaSeca = readFloat(formData.get('pesoPasillaSeca') as string | null);

  if (!loteId || isNaN(pesoCerezaProcesada)) {
    return { error: 'Datos inválidos' }
  }

  await leonoraDb.procesoLavado.update({
    where: { id },
    data: {
      fecha,
      loteId,
      pesoCerezaProcesada,
      pesoCafeMojado,
      pesoPasillaMojada,
      pesoCafeSeco,
      pesoPasillaSeca,
    }
  })

  revalidatePath('/proceso-lavado')
  return { success: true }
}

export async function deleteProcesoLavado(id: string) {
  await leonoraDb.procesoLavado.delete({ where: { id } })
  revalidatePath('/proceso-lavado')
}
