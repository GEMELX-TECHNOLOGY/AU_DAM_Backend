import { Router } from "express";
import {get_products} from "../controllers/productsController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/productos", verifyToken,get_products);

export default router;