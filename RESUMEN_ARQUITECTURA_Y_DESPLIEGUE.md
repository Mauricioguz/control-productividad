# Resumen de Arquitectura y Despliegue en Producción

Este documento resume la arquitectura final de la aplicación "Control de Productividad" y los pasos exactos que se tomaron para su despliegue en la nube. **Leer esto antes de hacer futuros cambios en la infraestructura.**

## 1. Stack Tecnológico Actual
- **Frontend / Backend:** Next.js (App Router).
- **ORM (Manejo de Base de Datos):** Prisma ORM (Versión 7+).
- **Base de Datos:** PostgreSQL alojada en [Neon.tech](https://neon.tech/).
- **Contenedores:** Docker (Modo multi-stage / Standalone).
- **Hosting / Servidor:** [Render.com](https://render.com/) (Web Service con runtime Docker).

## 2. Configuración de la Base de Datos (Neon + Prisma 7)
Se abandonó `SQLite / libsql` local para usar una base de datos PostgreSQL real en la nube, garantizando persistencia de datos.

**Detalles Críticos de Prisma 7:**
- En la versión 7 de Prisma, la propiedad `url` **YA NO SE PONE** dentro del archivo `prisma/schema.prisma`.
- El archivo `schema.prisma` solo contiene `provider = "postgresql"`.
- La URL de conexión se inyecta exclusivamente a través de **`prisma.config.ts`** en la raíz del proyecto.
- No se requiere la librería `dotenv` en el entorno de producción, ya que Render inyecta la variable nativamente.

El archivo `prisma.config.ts` debe verse así:
```typescript
export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
```

## 3. Arquitectura Docker
Se diseñó un `Dockerfile` optimizado en 3 etapas (Deps -> Builder -> Runner) aprovechando la función `output: 'standalone'` de Next.js.
- Esto reduce el tamaño de la imagen final eliminando el peso de `node_modules` que no se usan en ejecución.
- En la etapa final (Runner), se agregó el comando `COPY --from=builder /app/prisma.config.ts ./`. Esto es **obligatorio** para que Prisma 7 pueda encontrar la URL de la base de datos al arrancar el servidor.
- El servidor se inicia automáticamente ejecutando las migraciones (`npx prisma migrate deploy`) y luego el servidor web (`node server.js`).

## 4. Hosting en Render
- **Tipo de Proyecto:** Web Service (Docker).
- **Variable de Entorno Clave:** `DATABASE_URL`. Esta variable se configura manualmente en la pestaña "Environment" de Render. El valor debe ser la cadena de conexión de Neon (ej: `postgresql://neondb_owner:...`) **SIN comillas**.
- Render espera que el servicio responda en un puerto. Next.js por defecto usa el puerto `3000` internamente, lo cual se especificó en el `Dockerfile` (`ENV PORT=3000`).
- Por ser el plan gratuito, el servidor entra en hibernación tras 15 minutos sin uso. Despertarlo toma alrededor de 50 segundos.

## 5. Próximos Pasos (Deuda Técnica y Mejoras Futuras)
1. **Seguridad (Login):** Actualmente la URL pública expone los datos y permite editar o crear registros libremente. Se debe implementar un sistema de autenticación (ej. NextAuth.js o Clerk) para proteger las rutas.
2. **Backups de BD:** Configurar backups regulares en el panel de Neon (o aprovechar los que ya ofrece por defecto en la rama `main`).
3. **Manejo de Errores Frontend:** Implementar validaciones más robustas en los formularios del lado del cliente antes de enviar datos al servidor.

---
**Fecha de Despliegue Exitoso:** Mayo de 2026.
**Repositorio Principal:** `Mauricioguz/control-productividad`.
