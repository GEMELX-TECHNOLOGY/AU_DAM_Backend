import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';

export const get_activos = async (req:Request, res:Response)=>{
    try{
        const {categoria_id, estado_id, responsable_id, marca, modelo,numero_Serie, ubicacion}=req.query;
        const where :any ={};

        
        if (categoria_id) where.categoria_id = Number(categoria_id);
        if (estado_id) where.estado_id = Number(estado_id);
        if(responsable_id) where.responsable_id = Number(responsable_id);
        if (marca) where.marca = {contains: marca as string, mode: "insensitive"};
        if (modelo) where.modelo = {contains: modelo as string, mode: "insensitive"};
        if(numero_Serie) where.numero_Serie = Number(numero_Serie);
        if (ubicacion) where.ubicacion = {contains: ubicacion as string, mode:"insensitive"};

        const activos = await prisma.activo.findMany({
            where,
            include:{categoria:true, estado:true,responsable:true}
        });

        res.json(activos);

    }catch(error){
        res.status(500).json({error: "Error al obtener activos"})
    }
};

export const get_activo_id = async (req:Request, res:Response)=>{
  const {activo_id}=req.params;
  const id = Number(activo_id);
  
  if (isNaN(id)){
    return res.status(400).json({success:false, message:"ID de activo invalido"})
  }

  try{
    const activo = await prisma.activo.findUnique({
        where:{activo_id:id},
        include:{responsable:true, categoria:true, estado:true}
    })

    if (!activo){
        return res.status(404).json({success: false, message:"Activo no encontrado"})
    }

    return res.json({success:true, data: activo});
  }catch(error){
    console.error("Error al obtener activo", error);
    res.status(500).json({success:false,error})
  }
};

export const post_activo = async (req:Request, res:Response)=>{
    const{
        categoria_id,
        marca,
        modelo, 
        numero_Serie,
        ubicacion, 
        responsable_id,
        estado_id
    }= req.body;

    if(!categoria_id || !marca || !modelo || !numero_Serie || !ubicacion || !responsable_id || !estado_id){
        return res.status(400).json({success:false, message:"Faltan campos obligatorios"})
    }
    try{
        const newActivo = await prisma.activo.create({
            data:{
                categoria_id: Number(categoria_id),
                marca, 
                modelo,
                numero_serie: numero_Serie,
                ubicacion,
                responsable_id: Number(responsable_id),
                estado_id: Number(estado_id)
            },
            include:{
                categoria:true,
                responsable:true,
                estado:true
            }
        });

        await prisma.bitacora.create({
            data:{
                usuario_id:req.user?.usuario_id || 1,
                accion: "CREATE",
                entidad: "Activo",
                entidad_id:newActivo.activo_id,
                descripcion:`el usuario ${req.user?.usuario_id} creo el activo ${newActivo.marca} ${newActivo.modelo}`
            
            }
        });
        return res.status(201).json({success:true, data: newActivo})
    }catch(error){
        console.error("Error al crear activo",error);
        return res.status(500).json({success:false,error})
    }
};

export const put_activo = async (req: Request, res: Response) => {
  try {
    const usuario = req.user;

    if (usuario?.rol_id !== 1) {
      return res.status(403).json({
        success: false,
        message: "Solo el administrador puede actualizar este activo",
      });
    }

    const { id } = req.params;
    const activo_id = Number(id);
    if (isNaN(activo_id)) {
      return res.status(404).json({
        success: false,
        message: "ID de activo inválido",
      });
    }

    const allowedFields = ["categoria_id", "marca", "modelo", "numero_serie"];
    const bodyFields = Object.keys(req.body);

    const invalidFields = bodyFields.filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Los siguientes campos no se pueden actualizar: ${invalidFields.join(
          ", "
        )}. Solo se permiten: ${allowedFields.join(", ")}.`,
      });
    }

    const { categoria_id, marca, modelo, numero_serie } = req.body;
    const dataToUpdate: any = {};
    if (categoria_id !== undefined)
      dataToUpdate.categoria_id = Number(categoria_id);
    if (marca !== undefined) dataToUpdate.marca = marca;
    if (modelo !== undefined) dataToUpdate.modelo = modelo;
    if (numero_serie !== undefined) dataToUpdate.numero_serie = numero_serie;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe enviar al menos un campo válido para actualizar",
      });
    }

        const activoUpdate = await prisma.activo.update({
        where: { activo_id },
        data: dataToUpdate,
        select: {
            activo_id: true,
            categoria_id: true,
            marca: true,
            modelo: true,
            numero_serie: true,
        },
        });

    await prisma.bitacora.create({
        data:{
            usuario_id:req.user?.usuario_id || 1,
            accion:"UPDATE",
            entidad:"Activo",
            entidad_id:activoUpdate.activo_id,
            descripcion:`el usuario ${req.user?.usuario_id} actualizo el activo ${activoUpdate.marca} ${activoUpdate.modelo}`
        }
    })

    return res.json({success:true, data:activoUpdate})
}catch(error){
    console.error("Error al actualizar el activo",error)
    return res.status(500).json({success:false,error})
}
};