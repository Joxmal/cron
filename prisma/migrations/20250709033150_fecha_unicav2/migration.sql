/*
  Warnings:

  - Added the required column `updatedAt` to the `monedas` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_monedas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bcv_EUR" DECIMAL NOT NULL,
    "bcv_USD" DECIMAL NOT NULL,
    "bcv_CNY" DECIMAL NOT NULL,
    "bcv_TRY" DECIMAL NOT NULL,
    "bcv_RUB" DECIMAL NOT NULL,
    "fecha" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_monedas" ("bcv_CNY", "bcv_EUR", "bcv_RUB", "bcv_TRY", "bcv_USD", "fecha", "id") SELECT "bcv_CNY", "bcv_EUR", "bcv_RUB", "bcv_TRY", "bcv_USD", "fecha", "id" FROM "monedas";
DROP TABLE "monedas";
ALTER TABLE "new_monedas" RENAME TO "monedas";
CREATE UNIQUE INDEX "monedas_fecha_key" ON "monedas"("fecha");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
