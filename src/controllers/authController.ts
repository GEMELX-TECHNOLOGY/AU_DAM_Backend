import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';



// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo o contraseña incorrectos" });
  }

  const user = await prisma.usuario.findUnique({ where: { correo: email } });

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  if (!user.activo) {
    return res.status(403).json({ error: "Usuario inactivo" });
  }

  const isMatch = await bcrypt.compare(password, user.contrasena_hash);
  if (!isMatch) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  //  Access Token con toda la info del usuario
  const accessToken = jwt.sign(
    {
      id: user.usuario_id,
      email: user.correo,
      nombre: user.nombre,
      rol_id: user.rol_id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  //  Refresh Token con solo el ID
  const refreshToken = jwt.sign(
    { id: user.usuario_id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );


  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      usuario_id: user.usuario_id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  //  cookies 
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  //  Respuesta JSON mixta para Postman y front
  res.json({
    message: "Inicio de sesión exitoso",
    usuario: {
      id: user.usuario_id,
      nombre: user.nombre,
      correo: user.correo,
      rol_id: user.rol_id,
    },
    // Para pruebas en postman
    tokens: {
      accessToken,
      refreshToken,
    },
  });
};





//Usar este endpoint para refrescar en el front en cuanto detecte un 401
export const refreshToken = async (req:Request, res:Response) =>{
    const  {token} = req.body;
    if (!token){
        return res.status(401).json({error: "NO token provider"});

    };

    try{
        const storedToken = await prisma.refreshToken.findUnique({
            where: {token},
            include: {usuario: true},
        });

        if (!storedToken){
            return res.status(403).json({error:"Refresh token invalido"})
        }
        
        const user = storedToken.usuario;

        if(!user.activo){
            await prisma.refreshToken.delete({where:{id: storedToken.id}});
            return res.status(403).json({error: "Usuario inactivo"});
        }

        if (storedToken.expiresAt< new Date()){
            await prisma.refreshToken.delete ({
                where: {
                    id: storedToken.id
                }
            });
        }

        const newAcessToken = jwt.sign(
            {id: user.usuario_id, email:user.correo, rol_id:user.rol_id},
            process.env.JWT_SECRET!,
            {expiresIn:'15m'}
        );


        res.json({
            accessToken: newAcessToken,
        });
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Error al refrescar token"})
    }

    
}

export const logout = async (req:Request, res: Response )=>{
  const {token} = req.body;

  if (!token){
    return res.status(404).json({error: "token no existe"});
  }

  const refreshToken = await prisma.refreshToken.findUnique({where: {token:token}});

  if (!refreshToken){
    return res.status(404).json({error: "Refresh Token no encontrado"})
  }else{
    await prisma.refreshToken.delete({where:{token:token}})
  };

  return res.json({ message: "Sesión cerrada correctamente" });
}

export const me = async (req:Request, res: Response) => {
  
  const userId = (req as any).user.id;

  const user = await prisma.usuario.findUnique({
    where:{usuario_id:userId},
    select: {usuario_id:true, nombre:true, correo:true, rol_id:true, activo: true}  });

  if (!user){
    return res.status(404).json({error: "Usuario no encontrado"})

  }

  return res.json(user);

}