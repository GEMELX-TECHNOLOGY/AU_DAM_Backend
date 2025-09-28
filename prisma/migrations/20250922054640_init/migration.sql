-- CreateTable
CREATE TABLE "public"."Catalogo" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Producto" (
    "producto_id" SERIAL NOT NULL,
    "tipo_id" INTEGER NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "modelo" VARCHAR(100),
    "especificacion" TEXT,
    "imagen_url" VARCHAR(255),
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL,
    "proveedor_id" INTEGER,
    "fecha_ultima_compra" TIMESTAMP(3),
    "estado_id" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("producto_id")
);

-- CreateTable
CREATE TABLE "public"."Activo" (
    "activo_id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "modelo" VARCHAR(100),
    "numero_serie" VARCHAR(100),
    "ubicacion" VARCHAR(100),
    "responsable_id" INTEGER NOT NULL,
    "estado_id" INTEGER NOT NULL,

    CONSTRAINT "Activo_pkey" PRIMARY KEY ("activo_id")
);

-- CreateTable
CREATE TABLE "public"."Requisicion" (
    "requisicion_id" SERIAL NOT NULL,
    "solicitante_id" INTEGER NOT NULL,
    "area" VARCHAR(100) NOT NULL,
    "fecha" DATE NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "autorizador_id" INTEGER,
    "comentarios" TEXT,
    "cargo_camion" VARCHAR(100),
    "num_camion_eta" VARCHAR(50),
    "chofer" VARCHAR(50),
    "tipo_requisicion" VARCHAR(50) NOT NULL,
    "folio" VARCHAR(50),
    "descripcion_os" TEXT,

    CONSTRAINT "Requisicion_pkey" PRIMARY KEY ("requisicion_id")
);

-- CreateTable
CREATE TABLE "public"."RequisicionDetalle" (
    "detalle_id" SERIAL NOT NULL,
    "requisicion_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "RequisicionDetalle_pkey" PRIMARY KEY ("detalle_id")
);

-- CreateTable
CREATE TABLE "public"."Movimiento" (
    "movimiento_id" SERIAL NOT NULL,
    "tipo_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "responsable_id" INTEGER NOT NULL,
    "centro_costo_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("movimiento_id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "usuario_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "contraseña_hash" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "public"."Usuario"("correo");

-- AddForeignKey
ALTER TABLE "public"."Producto" ADD CONSTRAINT "Producto_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Producto" ADD CONSTRAINT "Producto_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activo" ADD CONSTRAINT "Activo_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activo" ADD CONSTRAINT "Activo_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activo" ADD CONSTRAINT "Activo_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisicion" ADD CONSTRAINT "Requisicion_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisicion" ADD CONSTRAINT "Requisicion_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisicion" ADD CONSTRAINT "Requisicion_autorizador_id_fkey" FOREIGN KEY ("autorizador_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequisicionDetalle" ADD CONSTRAINT "RequisicionDetalle_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "public"."Requisicion"("requisicion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequisicionDetalle" ADD CONSTRAINT "RequisicionDetalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."Producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."Producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimiento" ADD CONSTRAINT "Movimiento_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
