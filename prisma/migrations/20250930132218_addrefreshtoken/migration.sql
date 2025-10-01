-- DropForeignKey
ALTER TABLE "public"."Activo" DROP CONSTRAINT "Activo_categoria_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Activo" DROP CONSTRAINT "Activo_estado_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Activo" DROP CONSTRAINT "Activo_responsable_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimiento" DROP CONSTRAINT "Movimiento_centro_costo_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimiento" DROP CONSTRAINT "Movimiento_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimiento" DROP CONSTRAINT "Movimiento_responsable_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimiento" DROP CONSTRAINT "Movimiento_tipo_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_estado_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_tipo_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requisicion" DROP CONSTRAINT "Requisicion_autorizador_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requisicion" DROP CONSTRAINT "Requisicion_estado_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requisicion" DROP CONSTRAINT "Requisicion_solicitante_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequisicionDetalle" DROP CONSTRAINT "RequisicionDetalle_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequisicionDetalle" DROP CONSTRAINT "RequisicionDetalle_requisicion_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Usuario" DROP CONSTRAINT "Usuario_rol_id_fkey";

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- AddForeignKey
ALTER TABLE "public"."Producto" ADD CONSTRAINT "Producto_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Producto" ADD CONSTRAINT "Producto_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activo" ADD CONSTRAINT "Activo_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activo" ADD CONSTRAINT "Activo_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activo" ADD CONSTRAINT "Activo_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisicion" ADD CONSTRAINT "Requisicion_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisicion" ADD CONSTRAINT "Requisicion_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisicion" ADD CONSTRAINT "Requisicion_autorizador_id_fkey" FOREIGN KEY ("autorizador_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequisicionDetalle" ADD CONSTRAINT "RequisicionDetalle_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "public"."Requisicion"("requisicion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequisicionDetalle" ADD CONSTRAINT "RequisicionDetalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."Producto"("producto_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."Producto"("producto_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."Catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
