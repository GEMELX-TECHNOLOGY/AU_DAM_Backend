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

//get por id de producto

export const get_product_id = async (req:Request, res:Response)=>{
    const {producto_id}= req.params;
    const id = Number(producto_id);


    if(isNaN(id)){
        return res.status(400).json({success:false, message: "ID de producto invalido"});
    }
    
    try{
        const producto = await prisma.producto.findUnique({
            where: {producto_id:id},
            include:{
                proveedor:true,
                estado:true,
                tipo:true
            }
            
        })
        if (!producto){
            return res.status(404).json({sucess:false,message: "Producto no encontrado"});
        }
        return res.json({success:true, data:producto});
    }catch(error){
        console.error("Error al mostrar producto",error)
        res.status(500).json({success:false, error})
    }

}

export const create_product =async (req:Request, res:Response) =>{
    const {
        tipo_id,
        marca,
        modelo,
        especificacion,
        imagen_url,
        precio_unitario,
        stock_actual,
        proveedor_id,
        fecha_ultima_compra,
        estado_id
    }= req.body;
    
    if(!tipo_id || !marca || !modelo ||!precio_unitario ||!proveedor_id||!estado_id){
        return res.status(400).json({success:false, message:"faltan campos obligatorios"})
    };

    try{
        const newProduct = await prisma.producto.create({
            data:{
                tipo_id:Number(tipo_id),
                marca,
                modelo,
                especificacion,imagen_url,
                precio_unitario:Number(precio_unitario),
                stock_actual:Number(stock_actual),
                proveedor_id:Number(proveedor_id),
                fecha_ultima_compra: new Date(fecha_ultima_compra),
                estado_id:Number(estado_id),
                
            },
            include:{
                tipo:true,
                estado:true,
                proveedor:true
            }
        });

        await prisma.bitacora.create({
            data:{
                usuario_id:req.user?.usuario_id || 1,
                accion:"CREATE",
                entidad:"Producto",
                entidad_id:newProduct.producto_id,
                descripcion:`el usuario ${req.user?.usuario_id} creo el producto ${newProduct.marca} ${newProduct.modelo}`
            }
        });

        return res.status(201).json({
            success:true,
            data: newProduct
        })
    }catch(error){
        console.error("Error al crear el producto",error)
        return res.status(500).json({success:false, error})
    }
}