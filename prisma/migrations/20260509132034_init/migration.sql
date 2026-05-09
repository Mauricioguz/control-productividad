-- CreateTable
CREATE TABLE "Recolector" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recolector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "numeroArboles" INTEGER NOT NULL,
    "rendimientoTeorico" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalidaBodega" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalidaBodega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recoleccion" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "pesoCereza" DOUBLE PRECISION NOT NULL,
    "recolectorId" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recoleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcesoLavado" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "loteId" TEXT NOT NULL,
    "pesoCerezaProcesada" DOUBLE PRECISION NOT NULL,
    "pesoCafeMojado" DOUBLE PRECISION,
    "pesoPasillaMojada" DOUBLE PRECISION,
    "pesoCafeSeco" DOUBLE PRECISION,
    "pesoPasillaSeca" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcesoLavado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcesoFermentacion" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "loteId" TEXT NOT NULL,
    "pesoCerezaTotal" DOUBLE PRECISION NOT NULL,
    "diasFermentacion" INTEGER NOT NULL,
    "pesoCafeSeco" DOUBLE PRECISION,
    "pesoFlotesSegunda" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcesoFermentacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Recoleccion" ADD CONSTRAINT "Recoleccion_recolectorId_fkey" FOREIGN KEY ("recolectorId") REFERENCES "Recolector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recoleccion" ADD CONSTRAINT "Recoleccion_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoLavado" ADD CONSTRAINT "ProcesoLavado_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoFermentacion" ADD CONSTRAINT "ProcesoFermentacion_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
