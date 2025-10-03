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

