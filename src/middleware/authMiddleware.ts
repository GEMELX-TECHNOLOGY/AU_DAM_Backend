import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: token faltante' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'milpinas';
    const payload = jwt.verify(token, secret);

    // Guardamos la info del usuario en req.user para usar después
    (req as any).user = payload;

    next(); // pasa al siguiente middleware o ruta
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const verifyRole = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }

    next(); // todo bien, pasa a la ruta
  };
};

