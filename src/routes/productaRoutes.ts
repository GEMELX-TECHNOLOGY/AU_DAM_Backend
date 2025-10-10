import { Router } from "express";
import {create_product, get_alertas, get_product_id, get_products, get_stock, get_toxicos, put_estado, put_producto} from "../controllers/productsController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/productos/alertas/stock",verifyToken,get_alertas);
router.get("/productos/toxicos", verifyToken, get_toxicos);
router.get("/productos/:id/stock", verifyToken, get_stock);
router.get("/productos/:producto_id", verifyToken, get_product_id);



router.get("/productos/alertas/stock",verifyToken,get_alertas);
router.get("/productos", verifyToken, get_products);
router.post("/productos", verifyToken, create_product);
router.put("/productos/:id/estado", verifyToken, put_estado);
router.put("/productos/:id", verifyToken, put_producto);


export default router;
