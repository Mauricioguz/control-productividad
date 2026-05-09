import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Singleton de PrismaClient — evita múltiples conexiones en Next.js dev (hot reload)
function createLeonoraClient() {
  const dbUrl = process.env.DATABASE_URL
  console.log('[LEONORA] Conectando a base de datos PostgreSQL...')
  if (!dbUrl) {
    throw new Error('[LEONORA] DATABASE_URL no está definida en las variables de entorno.')
  }
  
  const pool = new Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

declare const globalThis: {
  LEONORA_RESCUE_INSTANCE: ReturnType<typeof createLeonoraClient>
} & typeof global

const leonoraDb = globalThis.LEONORA_RESCUE_INSTANCE ?? createLeonoraClient()

export default leonoraDb

if (process.env.NODE_ENV !== 'production') globalThis.LEONORA_RESCUE_INSTANCE = leonoraDb
