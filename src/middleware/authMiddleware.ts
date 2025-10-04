import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


declare global {
  namespace Express {
    interface Request {
      user?: {
        usuario_id: number;
        rol_id: number;
        isAdmin?: boolean;
      };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: token faltante' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'milpinas';
    const payload = jwt.verify(token, secret) as { id: number; rol_id: number };


    req.user = {
      usuario_id: payload.id,    
      rol_id: payload.rol_id,
      isAdmin: payload.rol_id === 1 
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const verifyRole = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }

    next();
  };
};
