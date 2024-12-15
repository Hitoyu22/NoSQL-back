import express, { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/users"; 
import SongsRoutes from "./routes/songs";
import ArtistRoutes from "./routes/artists";
import connectDB from "./config/db";
import GenresRoutes from "./routes/genres"; 
import PlaylistRoutes from "./routes/playlists";

connectDB();

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next(); 
});

app.use("/users", userRoutes); 
app.use("/songs", SongsRoutes); 
app.use("/artists", ArtistRoutes);
app.use("/genre", GenresRoutes);
app.use("/playlists", PlaylistRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "API fonctionnelle." });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
