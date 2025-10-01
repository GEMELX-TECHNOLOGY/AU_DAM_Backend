import { Router } from "express";
import {register } from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";


const router = Router();

router.post("/register", register);