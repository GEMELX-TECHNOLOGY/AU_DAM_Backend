/*
  Warnings:

  - You are about to drop the column `contraseña_hash` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `contrasena_hash` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "contraseña_hash",
ADD COLUMN     "contrasena_hash" VARCHAR(255) NOT NULL;
