import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';


//crear movimiento
export const post_movimiento = async (req:Request, res:Response) =>{
  const {id} = req.params;
  const producto_id= Number(id);

  if (isNaN(producto_id)){
    return res.status(400).json({success:false, message:"ID del producto invalido"});
  }
  
    const {
      tipo_id,
      cantidad,
      responsable_id,
      centro_costo_id,
      observaciones
    }= req.body;

    if (!tipo_id || !cantidad||!responsable_id|| !centro_costo_id||!observaciones){
      return res.status(400).json({success:false, message:"Faltan campos"})
    }
  try{
    const producto = await prisma.producto.findUnique({
      where:{producto_id},
      select:{stock_actual:true,precio_unitario:true}
    });

    if(!producto){
      return res.status(404).json({success:false, message:"Producto no encontrado"});
    };

    let newStock = producto.stock_actual;
    if(tipo_id===5){
      newStock +=cantidad;
    }else if (tipo_id===6){
      if(producto.stock_actual<cantidad){
        return res.status(400).json({success:false, message: "stock insuficiente para realizar la salida"});
      }newStock -= cantidad;
    }else{
      return res.status(400).json({success:false, message:"Movimiento invalido"})
    }

    const movimiento = await prisma.movimiento.create({
      data:{
        tipo_id,
        producto_id,
        cantidad,
        responsable_id,
        centro_costo_id,
        precio_unitario:producto.precio_unitario,
        observaciones
      },
    });

    await prisma.producto.update({
      where:{producto_id},
      data:{
        stock_actual: newStock,
        ...(tipo_id ===5 && {fecha_ultima_compra: new Date}),
      }
    })

    await prisma.bitacora.create({
      data:{
        usuario_id: responsable_id,
        accion:"MOVIMIENTO",
        entidad:"Producto",
        entidad_id:producto_id,
        descripcion:`Movimiento de ${cantidad} unidades (${tipo_id===5 ? "entrada" : "salida"})`,
      },
    });

    return res.status(201).json({
      success:true,
      message:"Movimiento registrado correctamente",
      data:movimiento,
    })
     
      
  }catch(error){
    console.log("Error al registrar movimiento",error);
    return res.status(500).json({
      success:false,
      message:"Error al registrar movimiento"
    })
  }
};

export const get_movimiento = async(req:Request, res:Response)=>{
    try{

        const{producto_id,responsable_id,fecha,cantidad} = req.query;

        const where: any ={};

        if (producto_id) where.product_id = Number(producto_id);
        if (responsable_id) where.responsable_id = Number(responsable_id);
        if (fecha) {
            const parsedFecha = new Date(String(fecha));
         if (!isNaN(parsedFecha.getTime())) {
         where.fecha = parsedFecha;
        } else {
        throw new Error("Formato de fecha inválido") }
        }
        if (cantidad) where.cantidad = Number(cantidad);

        const movimientos = await prisma.movimiento.findMany({
            where,
            include:{producto:true, responsable:true},
        })

        res.json(movimientos);
    }catch(error){
        console.error("Error al obtener los movimientos");
        res.status(500).json({error});
    }

};

export const get_movimiento_id = async (req:Request, res:Response)=>{
    const {movimiento_id} = req.params;
    const id = Number(movimiento_id);


    if(isNaN(id)){
        return res.status(400).json({success:false, message:"ID de movimiento invalido"});

    }

    try{
        const movimiento = await prisma.movimiento.findUnique({
            where:{movimiento_id:id},
            include:{
                producto:true,
                responsable:true,
                tipo:true,
                centro_costo:true
            }
        })
        if (!movimiento){
            return res.status(404).json({success:false, message:"Movimiento no encontrado"})
        }

        return res.json({
            success:true,data:movimiento
        })



    }catch(error){
        console.log("Error al mostrar movimiento");
        res.status(500).json({success:false, error})
    }
}


