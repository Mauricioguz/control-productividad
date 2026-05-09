'use server'

import leonoraDb from '@/lib/leonora-core'
import { revalidatePath } from 'next/cache'
import { getLotesConSaldo } from '@/lib/leonora-logic'

export async function getProcesosFermentacion() {
  return await leonoraDb.procesoFermentacion.findMany({
    orderBy: { fecha: 'desc' },
    include: { lote: true }
  })
}

export async function getLotes() {
  return await getLotesConSaldo()
}

export async function createProcesoFermentacion(formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const loteId = formData.get('loteId') as string
  const pesoCerezaTotal = parseFloat(formData.get('pesoCerezaTotal') as string)
  const diasFermentacion = parseInt(formData.get('diasFermentacion') as string, 10)
  
  const readFloat = (val: string | null) => val && !isNaN(parseFloat(val)) ? parseFloat(val) : null;
  const pesoCafeSeco = readFloat(formData.get('pesoCafeSeco') as string | null);
  const pesoFlotesSegunda = readFloat(formData.get('pesoFlotesSegunda') as string | null);

  if (!loteId || isNaN(pesoCerezaTotal) || isNaN(diasFermentacion)) {
    return { error: 'Datos inválidos' }
  }
  
  await leonoraDb.procesoFermentacion.create({
    data: {
      fecha,
      loteId,
      pesoCerezaTotal,
      diasFermentacion,
      pesoCafeSeco,
      pesoFlotesSegunda
    }
  })
  
  revalidatePath('/proceso-fermentacion')
  return { success: true }
}

export async function updateProcesoFermentacion(id: string, formData: FormData) {
  const fecha = new Date(formData.get('fecha') as string)
  const loteId = formData.get('loteId') as string
  const pesoCerezaTotal = parseFloat(formData.get('pesoCerezaTotal') as string)
  const diasFermentacion = parseInt(formData.get('diasFermentacion') as string, 10)
  
  const readFloat = (val: string | null) => val && !isNaN(parseFloat(val)) ? parseFloat(val) : null;
  const pesoCafeSeco = readFloat(formData.get('pesoCafeSeco') as string | null);
  const pesoFlotesSegunda = readFloat(formData.get('pesoFlotesSegunda') as string | null);

  if (!loteId || isNaN(pesoCerezaTotal) || isNaN(diasFermentacion)) {
    return { error: 'Datos inválidos' }
  }
  
  await leonoraDb.procesoFermentacion.update({
    where: { id },
    data: {
      fecha,
      loteId,
      pesoCerezaTotal,
      diasFermentacion,
      pesoCafeSeco,
      pesoFlotesSegunda
    }
  })
  
  revalidatePath('/proceso-fermentacion')
  return { success: true }
}

export async function deleteProcesoFermentacion(id: string) {
  await leonoraDb.procesoFermentacion.delete({ where: { id } })
  revalidatePath('/proceso-fermentacion')
}
