import { Router } from "express";
import {roles} from "../controllers/rolController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();


export default router;