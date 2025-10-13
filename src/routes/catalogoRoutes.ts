import { Router } from "express";
import {catalogo, post_catalogo, type_catalogo} from "../controllers/catalogoController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/catalogos", verifyToken,catalogo);
router.get("/catalogos/:tipo",verifyToken,type_catalogo)
router.post("/create", verifyToken,post_catalogo);



export default router;