/*
  Warnings:

  - Made the column `proveedor_id` on table `Producto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Producto" ALTER COLUMN "proveedor_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."Proveedor" (
    "proveedor_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "contacto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "email" VARCHAR(100),
    "direccion" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("proveedor_id")
);

-- AddForeignKey
ALTER TABLE "public"."Producto" ADD CONSTRAINT "Producto_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "public"."Proveedor"("proveedor_id") ON DELETE CASCADE ON UPDATE CASCADE;
