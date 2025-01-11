import { Request, Response, NextFunction } from "express";
import { Song } from "../models/Song";
import { RequestHandler } from 'express';
import { Artist } from "../models/Artist";
import { Playlist } from "../models/Playlist";
import { User } from "../models/User";
import FuzzySearch from 'fuzzy-search';
import multer from "multer";
import path from "path";
import fs from "fs";
import { Types } from "mongoose";

// Instance pour upload les images des musiques sur le serveur
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../images/songs");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `song-${uniqueSuffix}${extension}`);
    },
});

const upload = multer({ 
    storage, 
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Seuls les fichiers JPEG, PNG et JPG sont autorisés."));
        }
        cb(null, true);
    }
});

// Route pour ajouter une chanson
export const addSong: RequestHandler = async (req, res, next) => {
    upload.single("coverImage")(req, res, async (err) => {
        if (err) {
            console.error("Erreur lors de l'upload du fichier:", err);
            return res.status(400).json({ message: err.message });
        }

        const { title, artist, genre } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "L'image de couverture est requise." });
        }

        if (!genre) {
            return res.status(400).json({ message: "Les genres sont requis." });
        }

        const coverImageUrl = `/images/songs/${req.file.filename}`;

        let genresArray = genre
            .split(",")  
            .map((g: string) => g.trim())  
            .filter((g: string) => g.length > 0);

        if (genresArray.length === 0) {
            return res.status(400).json({ message: "Aucun genre valide trouvé." });
        }

        genresArray = genresArray.map((g: string) => {
            if (Types.ObjectId.isValid(g)) {
                return new Types.ObjectId(g); 
            }
            return g;  
        });

        const newSong = new Song({
            title,
            artist,
            genre: genresArray, 
            coverImageUrl,  
        });

        try {
            const savedSong = await newSong.save();

            const artistDoc = await Artist.findById(artist);
            if (!artistDoc) {
                return res.status(404).json({ message: "Artiste non trouvé." });
            }

            artistDoc.songs.push(savedSong._id);  
            await artistDoc.save();

            // Réponse réussie
            res.status(201).json({
                message: "Chanson ajoutée avec succès.",
                song: savedSong,
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout de la chanson:", error);
            res.status(500).json({ message: "Erreur interne du serveur." });
        }
    });
};

// Route pour lister toutes les chansons
export const listSongs: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const songs = await Song.find().populate("artist genre");

        const baseUrl = req.protocol + "://" + req.get("host");

        const songsWithFullImageUrl = songs.map(song => ({
            ...song.toObject(),
            coverImageUrl: baseUrl + song.coverImageUrl, 
        }));

        res.status(200).json(songsWithFullImageUrl);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour lister 7 chansons à afficher sur l'écran d'accueil (au hasard)
export const listSong: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const songs = await Song.find().populate("artist genre").limit(7);

        const baseUrl = req.protocol + "://" + req.get("host");

        const songsWithFullImageUrl = songs.map(song => ({
            ...song.toObject(),
            coverImageUrl: baseUrl + song.coverImageUrl, 
        }));

        res.status(200).json(songsWithFullImageUrl);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer une chanson par ID
export const getSongById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const song = await Song.findById(id).populate("artist genre");
        if (!song) {
            res.status(404).json({ message: "Chanson non trouvée." });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");
        song.coverImageUrl = baseUrl + song.coverImageUrl;

        res.status(200).json(song);
    } catch (error) {
        console.error("Erreur lors de la récupération de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer les chansons d'un artiste
export const getSongByArtist: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { artist } = req.params;
    try {
        const songs = await Song.find({ artist }).populate("artist genre");
        if (!songs || songs.length === 0) {
            res.status(404).json({ message: "Chansons non trouvées pour cet artiste." });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");

        const songsWithFullImageUrl = songs.map(song => ({
            ...song.toObject(),
            coverImageUrl: baseUrl + song.coverImageUrl,
        }));

        res.status(200).json(songsWithFullImageUrl);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer les chansons à partir d'une recherche textuelle
export const searchSongs: RequestHandler = async (req, res, next) => {
    const { query } = req.query;

    try {
        const allSongs = await Song.find().populate("artist genre").limit(10).exec();

        if (!query || typeof query !== "string") {
            const baseUrl = req.protocol + "://" + req.get("host");

            const allSongsWithFullImageUrl = allSongs.map(song => ({
                ...song.toObject(),  
                coverImageUrl: baseUrl + song.coverImageUrl,
            }));

            res.status(200).json(allSongsWithFullImageUrl);
            return;
        }

        const searcher = new FuzzySearch(allSongs.map(song => song.toObject()), ['title', 'artist.name', 'genre.name'], {
            caseSensitive: false,
            sort: true,
        });

        const result = searcher.search(query);

        if (result.length === 0) {
            res.status(204).json({ message: "Aucune chanson trouvée correspondant à votre recherche." });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");

        const resultWithFullImageUrl = result.map(song => ({
            ...song,  
            coverImageUrl: baseUrl + song.coverImageUrl,
        }));

        res.status(200).json(resultWithFullImageUrl);
    } catch (error) {
        console.error("Erreur lors de la recherche de chansons:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour mettre à jour une chanson
export const updateSong: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    upload.single('coverImage')(req, res, async (err) => {
      if (err) {
        console.error("Erreur lors de l'upload du fichier:", err);
        return res.status(400).json({ message: err.message });
      }
  
      const { id } = req.params;
      const { title, artist, genre } = req.body;
  
      try {
        const existingSong = await Song.findById(id);
        if (!existingSong) {
          return res.status(404).json({ message: "Chanson non trouvée." });
        }
  
        if (req.file) {
          const oldImagePath = existingSong.coverImageUrl 
            ? path.join(__dirname, "../../images/songs", existingSong.coverImageUrl.split('/').pop() || "") 
            : "";
          
          if (oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);  
          }
  
          const newCoverImageUrl = "/images/songs/" + req.file.filename;
          existingSong.coverImageUrl = newCoverImageUrl; 
        }
  
        existingSong.title = title || existingSong.title;
        existingSong.artist = artist || existingSong.artist;
        existingSong.genre = genre || existingSong.genre;
  
        const updatedSong = await existingSong.save();
  
        const artistDoc = await Artist.findById(artist);
        if (artistDoc) {
          const index = artistDoc.songs.indexOf(existingSong._id);
          if (index === -1) {
            artistDoc.songs.push(existingSong._id);
            await artistDoc.save();
          }
        }
  
        res.status(200).json(updatedSong);
  
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
      }
    });
  };

// Route pour supprimer une chanson
export const deleteSong: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    try {
        const song = await Song.findById(id);
        if (!song) {
            res.status(404).json({ message: "Chanson non trouvée." });
            return;
        }

        const oldImagePath = song.coverImageUrl ? path.join(__dirname, "../../images/songs", song.coverImageUrl.split('/').pop()!) : "";
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }

        await Song.findByIdAndDelete(id);

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

        res.status(200).json({ message: "Chanson et image supprimées avec succès." });

    } catch (error) {
        console.error("Erreur lors de la suppression de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour simuler l'écoute d'une musique
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

        const baseUrl = req.protocol + "://" + req.get("host");
        
        const songWithFullImageUrl = {
            ...song.toObject(),
            coverImageUrl: baseUrl + song.coverImageUrl,
        };

        res.status(200).json({ 
            song: songWithFullImageUrl,
            likesCount: song.likesCount,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des likes de la chanson:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour lister les chansons triées par genre
export const getSongsByGenre: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { idGenre } = req.params;

    try {
        const songs = await Song.find({ genre: idGenre }).populate("artist genre");

        if (!songs || songs.length === 0) {
            res.status(404).json({ message: "Aucune chanson trouvée pour ce genre." });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");

        const songsWithFullImageUrl = songs.map(song => ({
            ...song.toObject(),
            coverImageUrl: baseUrl + song.coverImageUrl,
        }));

        res.status(200).json(songsWithFullImageUrl);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons par genre:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
