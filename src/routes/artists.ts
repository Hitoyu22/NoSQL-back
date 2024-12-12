import express from "express";
import { 
    listArtists,
    addArtist,
    getArtistById,
    updateArtist,
    deleteArtist,
    listArtistSongs 
} from "../controllers/artistsController";

const router = express.Router();

router.get("/", listArtists);
router.post("/", addArtist); 
router.get("/:id", getArtistById); 
router.put("/:id", updateArtist); 
router.delete("/:id", deleteArtist); 
router.get("/:id/songs", listArtistSongs); 

export default router;