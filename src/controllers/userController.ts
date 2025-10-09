import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';

//GET USUARIOS
export const get_usuarios = async (req:Request,res:Response)=>{
    try{
        const usuarios = await prisma.usuario.findMany({
            select:{
                usuario_id:true,
                nombre: true,
                correo: true,
                rol_id: true,
                activo:true
            }
        });
        return res.status(200).json({success:true, data:usuarios});
    }catch(error){
        console.error("Error al mostrar todos los usuarios");
        return res.status(500).json({sucess:false,error});
    }
};
//GET USUARIO POR ID
export const get_usuario_id = async (req: Request, res: Response) => {
    const { id_usuario } = req.params;
    const id = Number(id_usuario);

    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID de usuario inválido" });
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { usuario_id: id },
            select:{
                usuario_id:true,
                nombre:true,
                correo:true,
                rol_id:true,
                activo:true
            }
        });

        if (!usuario) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        return res.json({ success: true, data: usuario });
    } catch (error) {
        console.error("Error al mostrar usuario:", error);
        return res.status(500).json({ success: false, error });
    }
};
//CREAR USUARIO
export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, rol_id, contrasena_hash } = req.body;

    if (!nombre || !correo || !rol_id || !contrasena_hash) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    //  Validación de contraseña fuerte
    const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).*$/;
    if (!passwordRegex.test(contrasena_hash)) {
      return res.status(400).json({
        error:
          "Contraseña débil: debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo",
      });
    }

    const existingUser = await prisma.usuario.findUnique({ where: { correo } });
    if (existingUser) {
      return res.status(409).json({ error: "Correo ya registrado" });
    }

    const hash = await bcrypt.hash(contrasena_hash, 10);

    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        rol_id,
        contrasena_hash: hash,
      },
      select: {
        usuario_id: true,
        nombre: true,
        correo: true,
        rol_id: true,
        activo: true,
      },
    });
            await prisma.bitacora.create({
            data:{
                usuario_id:req.user?.usuario_id || 1,
                accion:"CREATE",
                entidad:"Usuario",
                entidad_id:newUser.usuario_id,
                descripcion:`el usuario ${req.user?.usuario_id} creo el usuario ${newUser.nombre} ${newUser.correo}`
            }
        });

    res.status(201).json({ message: "Usuario creado", usuario: newUser });
  } catch (error) {
    console.error("Error al registrar usuario", error);
    return res.status(500).json({ success: false, error });
  }
};

//ACTUALIZAR USUARIO
export const update_user = async(req:Request,res:Response)=>{
    const id = Number(req.params.id_usuario);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID de usuario inválido" });
    }
    try{
        const {nombre, correo, rol_id, activo} = req.body;
        const dataToUpdate: any ={};
        if (nombre !== undefined) dataToUpdate.nombre=nombre;
        if (correo !== undefined) dataToUpdate.correo = correo;
        if (rol_id !== undefined) dataToUpdate.rol_id = rol_id;
        if (activo !== undefined) dataToUpdate.activo = activo;
        
        const userUpdate = await prisma.usuario.update({
            where:{
                usuario_id: id
            },
            select: {
                usuario_id: true,
                nombre: true,
                correo: true,
                rol_id: true,
                activo: true
            },
            data: dataToUpdate,
        });

        await prisma.bitacora.create({
          data:{
            usuario_id:req.user?.usuario_id|| 1,
            accion:"UPDATE",
            entidad: "Usuario",
            entidad_id:userUpdate.usuario_id,
            descripcion: `el usuario ${req.user?.usuario_id} actualizo el usuario ${userUpdate.nombre} con el correo: ${userUpdate.correo}`
          }
        })
        return res.json({success: true, data:userUpdate});
    }catch(error){
        console.error("Error al actualizar usuario")
        return res.status(506).json({sucess:false, error})   
    }  
};


// UPDATE PASSWORD
export const update_password = async (req: Request, res: Response) => {
  try {
   
    const userId = Number(req.params.id_usuario);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "ID de usuario inválido" });
    }


    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    if (req.user.usuario_id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).*$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Contraseña débil: debe tener mayúscula, minúscula, número y símbolo, y mínimo 8 caracteres",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "La confirmación no coincide" });
    }

    const user = await prisma.usuario.findUnique({
      where: { usuario_id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }


    const isCurrentCorrect = await bcrypt.compare(currentPassword, user.contrasena_hash);
    if (!isCurrentCorrect) {
      return res.status(401).json({ success: false, message: "Contraseña actual incorrecta" });
    }


    const isSameAsCurrent = await bcrypt.compare(newPassword, user.contrasena_hash);
    if (isSameAsCurrent) {
      return res.status(400).json({ success: false, message: "La nueva contraseña debe ser diferente" });
    }

    
    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { usuario_id: userId },
      data: { contrasena_hash: newHash },
    });

    await prisma.refreshToken.deleteMany({ where: { usuario_id: userId } });

    await prisma.bitacora.create({
     data:{
       usuario_id:req.user?.usuario_id || 1,
       accion:"UPDATE",
       entidad:"Password",
       entidad_id:newPassword.userId,
       descripcion:`el usuario ${req.user?.usuario_id} actualizo la password `
      }
    });  
    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada con éxito, vuelve a iniciar sesión",
    });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};