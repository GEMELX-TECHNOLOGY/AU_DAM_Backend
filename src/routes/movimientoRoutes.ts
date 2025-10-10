import { Router } from "express";
import {get_movimiento, get_movimiento_id, post_movimiento} from "../controllers/movimientosController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();
router.post("/productos/:id/movimientos",verifyToken,post_movimiento);
router.get("/movimientos",verifyToken,get_movimiento);
router.get("/movimientos/:movimiento_id",verifyToken,get_movimiento_id);

export default router;