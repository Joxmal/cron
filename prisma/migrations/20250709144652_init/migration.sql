-- CreateTable
CREATE TABLE "monedas" (
    "id" SERIAL NOT NULL,
    "bcv_EUR" DECIMAL(65,30) NOT NULL,
    "bcv_USD" DECIMAL(65,30) NOT NULL,
    "bcv_CNY" DECIMAL(65,30) NOT NULL,
    "bcv_TRY" DECIMAL(65,30) NOT NULL,
    "bcv_RUB" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monedas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monedas_fecha_key" ON "monedas"("fecha");
