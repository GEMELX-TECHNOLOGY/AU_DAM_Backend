import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prismaClient';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

const router = express.Router();


router.post("/login", async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Correo o contraseña incorrectos" });
    }
    
    const user = await prisma.usuario.findUnique({ where: {correo: email}});

    if (!user){
        return res.status(404).json({error: 'Usuario no encontrado'});

    }

    if (!user.activo){
        return res.status(403).json({error:'Usuario inactivo'});

    }

    //comparar contrasenas

    const isMatch = await bcrypt.compare(password,user.contrasena_hash);
    if (!isMatch){
        return res.status(401).json({error: "Contrasena incorrecta"});
    }

    //Generar JWT

    const token = jwt.sign(
        {id: user.usuario_id, email:user.correo, rol_id: user.rol_id},
        process.env.JWT_SECRET!,
        {expiresIn: "2h"}

    );

    res.json({ token, usuario: { usuario_id: user.usuario_id, nombre: user.nombre, rol_id: user.rol_id } });
});

export default router;
