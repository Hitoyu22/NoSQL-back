import { Artist } from "../models/Artist";
import { Song } from "../models/Song";
import { RequestHandler, Request, Response, NextFunction } from 'express';
import multer from "multer";
import path from "path";
import fs from "fs";
import { Types } from "mongoose";
import { Playlist } from "../models/Playlist";
import { User } from "../models/User";

// Instance de multer pour gérer l'upload des images des artistes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../images/artists");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            return;
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `artist-${uniqueSuffix}${extension}`);
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


// Route pour récupérer la liste des artistes
export const listArtists: RequestHandler = async (req, res, next) => {
    try {
        const artists = await Artist.find().populate("songs");

        const baseUrl = req.protocol + "://" + req.get("host");

        const artistsWithSongsAndImages = artists.map((artist) => {
            let artistWithFullProfileImageUrl = { ...artist.toObject() };
            if (artist.profilePictureUrl) {
                artistWithFullProfileImageUrl.profilePictureUrl = baseUrl + artist.profilePictureUrl;
            }

            const songsWithFullImageUrl = artist.songs.map((song: typeof Song.prototype) => {  
                if (song && song.coverImageUrl) {
                    const songImageUrl = baseUrl + song.coverImageUrl;  
                    return {
                        ...song.toObject(), 
                        coverImageUrl: songImageUrl,  
                    };
                }
                return song;  
            });

            return {
                ...artistWithFullProfileImageUrl,  
                songs: songsWithFullImageUrl,      
            };
        });

        res.status(200).json(artistsWithSongsAndImages);
    } catch (error) {
        console.error("Erreur lors de la récupération des artistes:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour ajouter un artiste
export const addArtist: RequestHandler = async (req, res, next) => {
    upload.single("profilePicture")(req, res, async (err) => {
        if (err) {
            console.error("Erreur lors de l'upload du fichier:", err);
            return res.status(400).json({ message: err.message });
        }

        const { userId, name, bio, genres } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        if (!name || !bio || !genres) {
            return res.status(400).json({ message: "Le nom, la biographie et les genres sont requis." });
        }

        let profilePictureUrl = "";
        
        if (req.file) {
            profilePictureUrl = "/images/artists/" + req.file.filename; 
        }

        let genresArray = genres
            .split(",") 
            .map((genre: string) => genre.trim()) 
            .filter((genre: string) => genre.length > 0); 

        genresArray = genresArray.map((genre: string) => {
            if (Types.ObjectId.isValid(genre)) {
                return new Types.ObjectId(genre); 
            }
            return genre;
        });

        const newArtist = new Artist({
            name,
            bio,
            profilePictureUrl,
            genres: genresArray,
            userId
        });

        try {
            const savedArtist = await newArtist.save();
            res.status(201).json({
                message: "Artiste créé avec succès.",
                artist: savedArtist
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'artiste:", error);
            res.status(500).json({ message: "Erreur interne du serveur." });
        }
    });
};

// Route pour récupérer un artiste par son ID
export const getArtistById: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        const artist = await Artist.findById(id).populate("songs");
        if (!artist) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");

        let artistWithFullProfileImageUrl = { ...artist.toObject() };
        if (artist.profilePictureUrl) {
            artistWithFullProfileImageUrl.profilePictureUrl = baseUrl + artist.profilePictureUrl;
        }

        const songsWithFullImageUrl = artist.songs.map((song: typeof Song.prototype) => {
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
            ...artistWithFullProfileImageUrl,  
            songs: songsWithFullImageUrl,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer le profil artiste d'un utilisateur
export const getArtistByUser: RequestHandler = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const artist = await Artist.findOne({ userId }).populate("songs");
        if (!artist) {
            res.status(204).json({ message: "Artiste non trouvé." });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");

        let artistWithFullProfileImageUrl = { ...artist.toObject() };
        if (artist.profilePictureUrl) {
            artistWithFullProfileImageUrl.profilePictureUrl = baseUrl + artist.profilePictureUrl;
        }

        const songsWithFullImageUrl = artist.songs.map((song: typeof Song.prototype) => {
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
            ...artistWithFullProfileImageUrl,  
            songs: songsWithFullImageUrl,      
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour mettre à jour son profil artiste
export const updateArtist: RequestHandler = async (req, res, next) => {
    upload.single('profilePicture')(req, res, async (err) => {
        if (err) {
            console.error("Erreur lors de l'upload du fichier:", err);
            return res.status(400).json({ message: err.message });
        }

        const { id } = req.params;
        const { name, bio, genres } = req.body;

        try {
            const artist = await Artist.findById(id);
            if (!artist) {
                return res.status(404).json({ message: "Artiste non trouvé." });
            }

            if (req.file) {
                const oldImagePath = artist.profilePictureUrl
                    ? path.join(__dirname, "../../images/artists", artist.profilePictureUrl.split('/').pop() || "")
                    : "";

                if (oldImagePath && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);  
                }

                artist.profilePictureUrl = "/images/artists/" + req.file.filename; 
            }

            artist.name = name || artist.name;
            artist.bio = bio || artist.bio;

            if (genres) {
                const genresArray = genres
                    .split(",") 
                    .map((genre: string) => genre.trim())
                    .filter((genre: string) => genre.length > 0);

                artist.genres = genresArray.map((genre: string) => {
                    if (Types.ObjectId.isValid(genre)) {
                        return new Types.ObjectId(genre); 
                    }
                    return genre; 
                });
            }

            const updatedArtist = await artist.save();

            res.status(200).json(updatedArtist);

        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'artiste:", error);
            res.status(500).json({ message: "Erreur interne du serveur." });
        }
    });
};

// Route pour supprimer son profil artiste
export const deleteArtist: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.body.userId;

    try {
        const artist = await Artist.findById(id);
        if (!artist) {
             res.status(404).json({ message: "Artiste non trouvé." });
        } else {
            if (artist.userId.toString() !== userId) {
                res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cet artiste." });
            }
        }

    
        const songsToDelete = await Song.find({ artist: id });
        for (let song of songsToDelete) {
            if (song.filePath && fs.existsSync(song.filePath)) {
                fs.unlinkSync(song.filePath);
            }
            if (song.coverImageUrl) {
                const imagePath = path.join(__dirname, "../../images/songs", song.coverImageUrl.split('/').pop() || "");
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            await song.deleteOne();
        }

        const playlistsToUpdate = await Playlist.find({ songs: { $in: songsToDelete.map(song => song._id) } });
        for (let playlist of playlistsToUpdate) {
            playlist.songs = playlist.songs.filter(songId => !songsToDelete.map(song => song._id).includes(songId));
            await playlist.save();
        }

        await User.updateMany(
            { favoriteArtists: id },
            { $pull: { favoriteArtists: id } }
        );

        if (artist && artist.profilePictureUrl) {
            const imagePath = path.join(__dirname, "../../images/artists", artist.profilePictureUrl.split('/').pop() || "");
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); 
            }
        }
        if (artist) {
            await artist.deleteOne();
        }

        res.status(200).json({ message: "Artiste et ses données supprimés avec succès." });

    } catch (error) {
        console.error("Erreur lors de la suppression de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer la liste des chansons d'un artiste
export const listArtistSongs: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        const artist = await Artist.findById(id).populate("songs");
        if (!artist) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }

        const baseUrl = req.protocol + "://" + req.get("host");

        const songsWithFullImageUrl = artist.songs.map((song: typeof Song.prototype) => {  
            if (song && song.coverImageUrl) {
                const songImageUrl = baseUrl + song.coverImageUrl;
                
                return {
                    ...song.toObject(),
                    coverImageUrl: songImageUrl,  
                };
            }
            return song;  
        });

        res.status(200).json(songsWithFullImageUrl);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

