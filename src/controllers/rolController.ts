import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';


export const roles = async (req:Request, res:Response)=>{
    try{
         const roles= await prisma.catalogo.findMany({
            where:{
                tipo: 'rol'
            },
            select: {
                id:true, nombre:true, descripcion:true
            },
            orderBy:{
                nombre:'asc'
            }
         });

         return res.status(201).json({success: true, data: roles});

    }catch (error){
        console.error("Roles error",error);
        return res.status(500).json({success: false, error:"Error al obtener roles"})
    }
}