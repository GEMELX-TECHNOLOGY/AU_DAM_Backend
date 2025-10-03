import { Router } from "express";
import {catalogo, type_catalogo} from "../controllers/catalogoController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/catalogos", verifyToken,catalogo);
router.get("/catalogos/:tipo",verifyToken,type_catalogo)



export default router;