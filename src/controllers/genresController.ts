import { Request, Response, NextFunction } from "express";
import { Genre } from "../models/Genre";
import { RequestHandler } from "express";

// Route pour lister tous les genres
export const listGenres: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const genres = await Genre.find();  
        res.status(200).json(genres);  
    } catch (error) {
        console.error("Erreur lors de la récupération des genres:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer un genre par ID
export const getGenreById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const genre = await Genre.findById(id);  
        if (!genre) {
            res.status(404).json({ message: "Genre non trouvé." });
            return;
        }
        res.status(200).json(genre);  
    } catch (error) {
        console.error("Erreur lors de la récupération du genre:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour ajouter un genre
export const addGenre: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;

    // Vérification si le nom du genre est présent
    if (!name) {
        res.status(400).json({ message: "Le nom du genre est requis." });
        return;
    }

    try {
        const newGenre = new Genre({
            name,
            description,
        });

        await newGenre.save();  

        res.status(201).json({ message: "Genre créé avec succès.", genre: newGenre }); 
    } catch (error) {
        console.error("Erreur lors de l'ajout du genre:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
