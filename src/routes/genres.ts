import express from "express";
import { listGenres, getGenreById, addGenre } from "../controllers/genresController";

const router = express.Router();

// Liste des routes pour les genres

router.get("/", listGenres);
router.get("/:id", getGenreById);
router.post("/", addGenre);

export default router;
