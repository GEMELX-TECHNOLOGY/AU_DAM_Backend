import { Router } from "express";
import { login,refreshToken,logout,me} from "../controllers/authController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me",verifyToken, me)

export default router;
