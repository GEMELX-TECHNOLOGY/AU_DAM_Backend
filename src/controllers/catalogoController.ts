import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';


export const catalogo = async (req:Request, res:Response)=>{
    try{
        const catalogo = await prisma.catalogo.findMany();
        return res.status(200).json({sucess: true,data: catalogo});

    }catch(error){
        console.error("Error en catalogo",error);
        return res.status(500).json({sucess: false,error:"error al obtener catalogos"})
    }
};

export const type_catalogo = async(req:Request, res: Response)=>{
    const {tipo} = req.params
    try{
        const catalogos = await prisma.catalogo.findMany({
        where: { tipo: tipo }
       });
      res.json(catalogos);
    


    }catch(error){
        console.error("Error al encontrar catalogos por tipo",error);
        return res.status(500).json({sucess:false, error})
    }
}

export const post_catalogo = async (req:Request, res:Response)=>{
    const {tipo, nombre, descripcion}= req.body;

    if (!tipo || !nombre || !descripcion){
        return res.status(400).json({success:false, message:"faltan campos"});

    };
    try{
        const newCatalogo = await prisma.catalogo.create({
            data:{
                tipo,
                nombre,
                descripcion
            },
            
        });

        await prisma.bitacora.create({
            data:{
                usuario_id:req.user?.usuario_id || 1,
                accion:"CREATE",
                entidad:"CATALOGO",
                entidad_id:newCatalogo.id,
                descripcion:`el usuario ${req.user?.usuario_id} creo el catalogo ${newCatalogo.tipo} con nombre: ${newCatalogo.nombre}`
            }

        });
        return res.status(201).json({success:true, data:newCatalogo})

    }catch(error){
        console.error("Error al crear catalogo");
        return res.status(500).json({sucess:false, error})
    }
}