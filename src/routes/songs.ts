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
    searchSongs,
    getSongByArtist,
    listSong
} from "../controllers/songsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Liste des routes pour les chansons

router.get("/", listSongs); 
router.get("/recommandations", listSong);
router.post("/", authMiddleware, addSong); 
router.get("/search", searchSongs);
router.get("/:id", getSongById); 
router.put("/:id", authMiddleware, updateSong); 
router.delete("/:id", authMiddleware, deleteSong); 
router.post("/:id/play", playSong); 
router.get("/:id/likes", listLikes);
router.get("/genre/:idGenre", getSongsByGenre);
router.get("/artist/:artist", getSongByArtist);

export default router;
