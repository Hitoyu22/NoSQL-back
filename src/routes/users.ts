import express from "express";
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUser, 
    deleteUser, 
    getLikedSongs, 
    addLikedSong, 
    removeLikedSong, 
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
router.get("/:id/liked-songs", authMiddleware, getLikedSongs);
router.post("/:id/liked-songs", authMiddleware, addLikedSong);
router.delete("/:id/liked-songs", authMiddleware, removeLikedSong);
router.get("/:id/favorite-artists", authMiddleware, getFavoriteArtists);
router.post("/:id/favorite-artists", authMiddleware, addFavoriteArtist);
router.delete("/:id/favorite-artists", authMiddleware, unfavoriteArtist);


export default router;
