import { Router } from "express";
import {get_usuario_id, get_usuarios, register, update_password, update_user } from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";


const router = Router();
router.get("/usuarios",verifyToken,get_usuarios);
router.get("/usuarios/:id_usuario",verifyToken,get_usuario_id);
router.post("/register",verifyToken, register);
router.put("/update/:id_usuario",verifyToken,update_user)
router.put("/update/:id_usuario/password", verifyToken, update_password);


export default router;