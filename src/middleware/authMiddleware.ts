import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        usuario_id: number;
        rol_id: number;
        email?: string;
        nombre?: string;
        isAdmin?: boolean;
      };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  //  Buscar token en cookie o en header
  const authHeader = req.headers["authorization"];
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
  const token = tokenFromHeader || req.cookies?.accessToken; //  también desde cookies

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado: token faltante" });
  }

  try {
    //  Verificar token
    const secret = process.env.JWT_SECRET || "milpinas";
    const payload = jwt.verify(token, secret) as {
      id: number;
      rol_id: number;
      email?: string;
      nombre?: string;
    };

    // Cargar info al request
    req.user = {
      usuario_id: payload.id,
      rol_id: payload.rol_id,
      email: payload.email,
      nombre: payload.nombre,
      isAdmin: payload.rol_id === 1,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const verifyRole = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!roles.includes(user.rol_id)) {
      return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
    }

    next();
  };
};
