-- CreateTable
CREATE TABLE "public"."Bitacora" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "entidad_id" INTEGER,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Bitacora" ADD CONSTRAINT "Bitacora_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."Usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
