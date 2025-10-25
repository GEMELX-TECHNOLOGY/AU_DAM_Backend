import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { get_activo_id, get_activos, post_activo, put_activo } from "../controllers/activosController";
const router = Router();

router.get("/activos", verifyToken, get_activos);
router.get("/:activo_id", verifyToken, get_activo_id);
router.post("/activos",verifyToken, post_activo);
router.put("/activos/:id",verifyToken,put_activo);
export default router;