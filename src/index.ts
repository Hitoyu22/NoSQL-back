import express, { Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());

// Middleware global
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Passer à la prochaine étape
});


app.get("/", (req: Request, res: Response) => {
    res.send("Hello World !");
    });

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
