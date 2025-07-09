/*
  Warnings:

  - A unique constraint covering the columns `[fecha]` on the table `monedas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "monedas_fecha_key" ON "monedas"("fecha");
