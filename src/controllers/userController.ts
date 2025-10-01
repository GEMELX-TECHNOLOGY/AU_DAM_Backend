import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';


export const register = async (req:Request, res:Response) =>{
    
       const {nombre, correo, rol_id, contrasena_hash} = req.body;

       if (!nombre || !correo ||!rol_id || !contrasena_hash){
        return res.status(400).json({error: "Faltan datos"});
       };

       const existingUser = await prisma.usuario.findUnique({where: {correo} });
       if (existingUser){
        return res.status(409).json({error: "Correo ya registrado"});
       };
       const hash = await bcrypt.hash(contrasena_hash, 10
       )

       const newUser = await prisma.usuario.create({
        data:{
            nombre,
            correo,
            rol_id,
            contrasena_hash: hash,
        },
       });
       res.status(201).json({message:"Usuario creado ", usuario: newUser});
};
