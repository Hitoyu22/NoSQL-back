import { Request, Response, NextFunction, RequestHandler } from "express";
import { Playlist } from "../models/Playlist";
import { Song } from "../models/Song";
import mongoose from "mongoose";

import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../images/playlists"); 

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `playlist-${uniqueSuffix}${extension}`); 
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
    },
});


// Route pour créer une playlist
export const createPlaylist: RequestHandler = async (req, res, next) => {
    upload.single("coverImageUrl")(req, res, async (err) => {
        if (err) {
            res.status(400).json({ message: "Erreur lors du téléchargement de l'image", error: err.message });
            return;
        }

        const { name, description, isPublic, user } = req.body;

        if (!user) {
            res.status(401).json({ message: "Utilisateur non authentifié" });
            return;
        }

        const userId = new mongoose.Types.ObjectId(user);

        let coverImageUrl = "";
        if (req.file) {
            coverImageUrl = `/images/playlists/${req.file.filename}`;
        }

        const newPlaylist = new Playlist({
            name,
            description,
            user: userId,
            isPublic: isPublic || false,
            coverImageUrl,
        });

        try {
            await newPlaylist.save();
            res.status(201).json({ message: "Playlist créée avec succès", playlist: newPlaylist });
        } catch (error) {
            console.error("Erreur lors de la création de la playlist:", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    });
};

// Route pour récupérer toutes les playlists d'un user
export const getUserPlaylists: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.params.id;

    if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
    }

    try {
        const playlists = await Playlist.find({ user: userId }).select("-songs");

        const baseUrl = req.protocol + "://" + req.get("host");

        const playlistsWithFullImageUrl = playlists.map((playlist) => {
            if (playlist.coverImageUrl) {
                const playlistImageUrl = baseUrl + playlist.coverImageUrl;
                return {
                    ...playlist.toObject(),
                    profilePictureUrl: playlistImageUrl,  
                };
            }
            return playlist;  
        });

        res.status(200).json(playlistsWithFullImageUrl);
    } catch (error) {
        console.error("Erreur lors de la récupération des playlists:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};
// Route pour ajouter une chanson à une playlist
export const addSongToPlaylist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { idPlaylist } = req.params;
    const { idSong } = req.body;

    try {
        const playlist = await Playlist.findById(idPlaylist);

        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        if (playlist.songs.includes(idSong)) {
            res.status(409).json({ message: "Cette chanson est déjà dans la playlist." });
            return;
        }

        playlist.songs.push(idSong);
        await playlist.save();

        res.status(200).json({ message: "Chanson ajoutée à la playlist", playlist });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la chanson à la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Route pour récupérer une playlist avec les chansons incluses
export const getPlaylistWithSongs: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { idPlaylist } = req.params;

    try {
        const playlist = await Playlist.findById(idPlaylist).populate("songs");

        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");

        const playlistWithFullImageUrl = playlist.coverImageUrl
            ? {
                  ...playlist.toObject(),
                  coverImageUrl: baseUrl + playlist.coverImageUrl,
              }
            : playlist.toObject();

        const songsWithFullImageUrl = playlist.songs.map((song: typeof Song.prototype) => {
            if (song && song.coverImageUrl) {
                const songImageUrl = baseUrl + song.coverImageUrl; 
                return {
                    ...song.toObject(),
                    coverImageUrl: songImageUrl, 
                };
            }
            return song; 
        });

        res.status(200).json({
            ...playlistWithFullImageUrl,
            songs: songsWithFullImageUrl,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


// Route pour supprimer une chanson d'une playlist
export const removeSongFromPlaylist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { idPlaylist, idSong } = req.params;

    try {
        const playlist = await Playlist.findById(idPlaylist);
        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        const songId = new mongoose.Types.ObjectId(idSong);

        const songIndex = playlist.songs.indexOf(songId);
        if (songIndex === -1) {
            res.status(404).json({ message: "Chanson non trouvée dans la playlist" });
            return;
        }

        playlist.songs.splice(songIndex, 1);
        await playlist.save();

        res.status(200).json({ message: "Chanson supprimée de la playlist", playlist });
    } catch (error) {
        console.error("Erreur lors de la suppression de la chanson de la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


// Route pour supprimer une playlist
export const deletePlaylist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { idPlaylist } = req.params;

    try {
        const playlist = await Playlist.findById(idPlaylist);

        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        if (playlist.coverImageUrl) {
            const imagePath = path.join(__dirname, "../../", playlist.coverImageUrl);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression de l'image:", err);
                } else {
                    console.log(`Image ${imagePath} supprimée avec succès`);
                }
            });
        }

        await Playlist.findByIdAndDelete(idPlaylist);

        res.status(200).json({ message: "Playlist supprimée avec succès", playlist });
    } catch (error) {
        console.error("Erreur lors de la suppression de la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};