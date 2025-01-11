# Projet NoSQL - Partie Back 

## Groupe 2 : 
- Rémy THIBAUT
- Ana Fernandes

## Présentation du projet 

Le projet consiste à recréer une application de musique comme Spotify en permettant d'ajouter des musiques, des artistes, d'aimer des chansons et même de les écouter.

Ce projet contient le frontend de l'application. 
Le backend se trouve à cette adresse : https://github.com/Hitoyu22/NoSQL-front 

## Dépendances du projet 

Les librairies utilisées pour ce projet sont : 
- **Express JS** pour créer les API.
- **bcrypt** pour le hashage des mots de passe.
- **cors** pour gérer l'origine des appels API.
- **dotenv** pour gérer les variables d'environnement.
- **mongoose** pour faciliter les intéractions avec la base de données mongoDB.
- **multer** pour gérer l'import d'image sur le serveur. 

## Installation et lancement du projet


### Importer le jeu de données 

Dans le dossier ./projet-nosql, une base de données MongoDb contenant un jeu de données pour se projet a été exporté. 

Afin de pouvoir tester le projet, il est conseillé de partir de ce jeu de données pour faciliter la suite. 

Les étapes à suivre sont les suivantes : 
- Créer une base de données vierge sur MongoDB (par exemple depuis l'interface Compass), supposons que votre bdd se nomme **test** pour la suite.
- Utilise la commande suivante pour importer la backup dans la base de données : 
```bash
mongorestore --uri="mongodb://localhost:27017/test" ./projet-nosql/
```

Vous devriez normalement avoir accès dans MongoDb a une base de données test avec toutes les données importées. 

NA : Les images ne sont pas stockées en base de données mais dans un dossier à la racine de ce projet : **/images/**.
Pour des raisons de bon fonctionnement et d'affichage, il est conseillé de ne pas supprimer ces images manuellement.

### Télécharger le projet 

Pour télécharger le projet, il vous suffit de faire la commande suivante :

```bash
git clone https://github.com/Hitoyu22/noSQL-back
cd noSQL-front
```

### Installer les dépendances 

Pour installer les dépendances, il faut avoir au préalable : 
- **Node JS** (version 20 ou supérieur).
- **NPM** (version 10 ou supérieur).
- Une base de données NoSQL **MongoDB**.

Il ne vous reste ensuite plus qu'à lancer la commande suivante pour installer les dépendances Node du projet : 

```bash
npm install
```

### Configuration des variables d'environnements

Pour lancer le projet, ce dernier doit pouvoir se connecter au serveur.

Vous avez besoin d'un fichier d'environnement .env pour utiliser le projet en mode développement : 

```bash
touch .env
```

Et ajoutez les variables suivantes : 

- MONGO_URI = (correspond à l'url de connexion de votre base de données MongoDB : mongodb://url:port/nameDB).
- JWT_SECRET= (correspond à la clé qui sera utilisée pour chiffrer et pour vérifier les tokens).


### Lancer le projet 

Une fois toutes les étapes précédentes effectuées, vous n'avez plus qu'à lancer la commande suivante pour accéder au front (par défaut, l'url du front sera **http://localhost:3000**) : 

```bash
npm start
```

