import express from "express";
import { 
    listArtists,
    addArtist,
    getArtistById,
    updateArtist,
    deleteArtist,
    listArtistSongs, 
    getArtistByUser
} from "../controllers/artistsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Liste des routes pour les artistes

router.get("/", listArtists);
router.post("/", addArtist); 
router.get("/:id", getArtistById); 
router.get("/user/:userId", getArtistByUser);
router.put("/:id", updateArtist); 
router.delete("/:id", authMiddleware, deleteArtist); 
router.get("/:id/songs", listArtistSongs); 

export default router;