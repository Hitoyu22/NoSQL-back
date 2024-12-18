import express from "express";
import { 
    listSongs,
    addSong,
    getSongById,
    updateSong,
    deleteSong,
    playSong,
    listLikes,
    getSongsByGenre,
    searchSongs
} from "../controllers/songsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", listSongs); 
router.post("/", authMiddleware, addSong); 
router.get("/search", searchSongs);
router.get("/:id", getSongById); 
router.patch("/:id", authMiddleware, updateSong); 
router.delete("/:id", authMiddleware, deleteSong); 
router.post("/:id/play", playSong); 
router.get("/:id/likes", listLikes);
router.get("/idGenre", getSongsByGenre);

export default router;
