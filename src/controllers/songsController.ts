import { Request, Response, NextFunction } from "express";
import { Song } from "../models/Song";
import { RequestHandler } from 'express';
import { Artist } from "../models/Artist";
import { Playlist } from "../models/Playlist";
import { User } from "../models/User";
import FuzzySearch from 'fuzzy-search';

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

    const newSong = new Song({
        title,
        artist,
        genre,
        filePath,
        coverImageUrl,
    });

    try {
        const savedSong = await newSong.save();

        const artistDoc = await Artist.findById(artist);
        if (!artistDoc) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }

        artistDoc.songs.push(savedSong._id);

        await artistDoc.save();

        res.status(201).json({
            message: "Chanson ajoutée avec succès",
            song: savedSong,
        });
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

export const searchSongs: RequestHandler = async (req, res, next) => {
    const { query } = req.query; 

    try {
        const allSongs = await Song.find().populate("artist genre").limit(10).exec();

        if (!query || typeof query !== "string") {
            res.status(200).json(allSongs);
            return;
        }

        const searcher = new FuzzySearch(allSongs, ['title', 'artist.name', 'genre.name'], {
            caseSensitive: false,
            sort: true
        });

        const result = searcher.search(query);

        if (result.length === 0) {
            res.status(204).json({ message: "Aucune chanson trouvée correspondant à votre recherche." });
            return;
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de la recherche de chansons:", error);
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
export const deleteSong: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    try {
        const song = await Song.findByIdAndDelete(id);
        if (!song) {
            res.status(404).json({ message: "Chanson non trouvée." });
            return;
        }

        await Playlist.updateMany(
            { songs: id }, 
            { $pull: { songs: id } }
        );

        await User.updateMany(
            { likedSongs: id },
            { $pull: { likedSongs: id } }
        );

        await Artist.updateMany(
            { songs: id },
            { $pull: { songs: id } }
        );

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

        song.viewsCount += 1;
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

// Route pour lister les chansons par genre
export const getSongsByGenre: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { idGenre } = req.params;

    try {
        const songs = await Song.find({ genre: idGenre }).populate("artist genre");

        if (!songs || songs.length === 0) {
            res.status(404).json({ message: "Aucune chanson trouvée pour ce genre." });
            return;
        }

        res.status(200).json(songs);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons par genre:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
