import { Router } from "express";
import {create_product, get_product_id, get_products} from "../controllers/productsController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/productos", verifyToken,get_products);
router.get("/productos/:producto_id",verifyToken,get_product_id);
router.post("/productos",verifyToken,create_product);

export default router;