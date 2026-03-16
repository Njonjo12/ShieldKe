import express from "express";
import { getLawyers } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/lawyers", authMiddleware, getLawyers);

export default router;
