import { Request, Response, NextFunction } from "express";
import { Song } from "../models/Song";
import { RequestHandler } from 'express';

// Route pour lister toutes les chansons
export const listSongs: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const songs = await Song.find().populate("artist genre");
        res.status(200).json(songs);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour ajouter une nouvelle chanson
export const addSong: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { title, artist, genre, coverImageUrl, filePath } = req.body;

    if (!filePath) {
        res.status(400).json({ message: "Le fichier audio est requis." });
        return;
    }

    const newSong = new Song({
        title,
        artist,
        genre,
        filePath, 
        coverImageUrl,
    });

    try {
        await newSong.save();
        res.status(201).json({ message: "Chanson ajoutée avec succès", song: newSong });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer une chanson spécifique par ID
export const getSongById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const song = await Song.findById(id).populate("artist genre");
        if (!song) {
            res.status(404).json({ message: "Chanson non trouvée." });
            return;
        }
        res.status(200).json(song);
    } catch (error) {
        console.error("Erreur lors de la récupération de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour modifier une chanson
export const updateSong: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, artist, genre, coverImageUrl } = req.body;

    try {
        const song = await Song.findByIdAndUpdate(
            id,
            { title, artist, genre, coverImageUrl },
            { new: true }
        );
        if (!song) {
            res.status(404).json({ message: "Chanson non trouvée." });
            return;
        }
        res.status(200).json(song);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour supprimer une chanson
export const deleteSong: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const song = await Song.findByIdAndDelete(id);
        if (!song) {
             res.status(404).json({ message: "Chanson non trouvée." });
             return;
        }

        res.status(200).json({ message: "Chanson supprimée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour augmenter le nombre de lectures d'une chanson
export const playSong: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const song = await Song.findById(id);
        if (!song) {
            res.status(404).json({ message: "Chanson non trouvée." });
            return;
        }

        song.likesCount += 1;
        await song.save();

        res.status(200).json({ message: "Lecture augmentée", song });
    } catch (error) {
        console.error("Erreur lors de la lecture de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour lister les utilisateurs ayant aimé une chanson
export const listLikes: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const song = await Song.findById(id);
        if (!song) {
            res.status(404).json({ message: "Chanson non trouvée." });
            return;
        }

        res.status(200).json({ likes: song.likesCount });
    } catch (error) {
        console.error("Erreur lors de la récupération des likes de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
