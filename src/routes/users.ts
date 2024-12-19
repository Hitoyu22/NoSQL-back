import express from "express";
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUser, 
    deleteUser, 
    getFavoriteArtists, 
    addFavoriteArtist, 
    unfavoriteArtist 
} from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", registerUser); 
router.post("/login", loginUser);        
router.get("/me", authMiddleware, getUserProfile); 
router.put("/:id", authMiddleware, updateUser); 
router.delete("/:id", authMiddleware, deleteUser);
router.get("/:id/favorite-artists", authMiddleware, getFavoriteArtists);
router.post("/favorite-artists", authMiddleware, addFavoriteArtist);
router.delete("/favorite-artists/:idArtist", authMiddleware, unfavoriteArtist);


export default router;
