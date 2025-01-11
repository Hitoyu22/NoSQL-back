import express, { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/users"; 
import SongsRoutes from "./routes/songs";
import ArtistRoutes from "./routes/artists";
import connectDB from "./config/db";
import GenresRoutes from "./routes/genres"; 
import PlaylistRoutes from "./routes/playlists";
const cors = require('cors');
import path from 'path';

// Connexion à la base de données
connectDB();

const app = express();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Configuration du CORS (Cross-Origin Resource Sharing)
// Permet d'autoriser l'accès à l'API depuis n'importe quelle origine et de spécifier les méthodes HTTP autorisées
app.use(
  cors({
    origin: "*", // Accepter toutes les origines
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP autorisées
    allowedHeaders: ["Content-Type", "Authorization"], // En-têtes autorisées
  })
);

// Log dans la console de l'API exécutée
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`); 
  next();
});

// Configuration pour servir les images de chanson, d'artiste et de playlist
const imagesSongPath = path.resolve(__dirname, '../images/songs');
app.use('/images/songs', express.static(imagesSongPath)); // Route pour accéder aux images de chansons

const imagesArtistPath = path.resolve(__dirname, '../images/artists');
app.use('/images/artists', express.static(imagesArtistPath)); // Route pour accéder aux images des artistes

const imagesPlaylistPath = path.resolve(__dirname, '../images/playlists');
app.use('/images/playlists', express.static(imagesPlaylistPath)); // Route pour accéder aux images des playlists

// Utilisation des routes pour les différentes entités de l'application
app.use("/users", userRoutes); // Gestion des utilisateurs
app.use("/songs", SongsRoutes); // Gestion des chansons
app.use("/artists", ArtistRoutes); // Gestion des artistes
app.use("/genre", GenresRoutes); // Gestion des genres
app.use("/playlists", PlaylistRoutes); // Gestion des playlists

// Route par défaut pour vérifier que l'API fonctionne
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "API fonctionnelle." }); // Retourne un message de succès
});

// Démarrage du serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
