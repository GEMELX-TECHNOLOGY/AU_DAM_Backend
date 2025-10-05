import { Router } from "express";
import {get_product_id, get_products} from "../controllers/productsController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/productos", verifyToken,get_products);
router.get("/productos/:producto_id",verifyToken,get_product_id)

export default router;