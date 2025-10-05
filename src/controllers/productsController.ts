import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';

//Ayuda al filtrado del front =)
export const get_products = async (req: Request, res: Response) => {
  try {
    const { product_id, tipo_id, marca, modelo, precio_unitario, proveedor_id, estado_id } = req.query;

    const where: any = {};

    if (tipo_id) where.tipo_id = Number(tipo_id);
    if (product_id) where.product_id = Number(product_id);
    if (marca) where.marca = { contains: marca as string, mode: "insensitive" };
    if (modelo) where.modelo = { contains: modelo as string, mode: "insensitive" };
    if (precio_unitario) where.precio_unitario = Number(precio_unitario);
    if (proveedor_id) where.proveedor_id = Number(proveedor_id);
    if (estado_id) where.estado_id = Number(estado_id);

    const products = await prisma.producto.findMany({
      where,
      include: { tipo: true, estado: true, proveedor: true }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};
