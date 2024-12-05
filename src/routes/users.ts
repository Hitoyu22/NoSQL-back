import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", registerUser); 
router.post("/login", loginUser);        
router.get("/me", authMiddleware, getUserProfile); 

export default router;
