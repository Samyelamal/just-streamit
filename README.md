# JustStreamIt

Page web consommant l'API JustStreamIt : meilleur film, films les mieux notés,
deux catégories fixes (Mystère, Comédies), une catégorie au choix, et une
modale de détail par film.

## Prérequis

- L'API OCMovies doit tourner en local sur `http://localhost:8000/api/v1`
  (adresse modifiable dans `js/config.js`).
- Le JavaScript est chargé en modules ES (`<script type="module">`), donc la
  page doit être servie par un serveur local — l'ouverture directe du fichier
  `index.html` (`file://`) ne fonctionnera pas.

## Démarrer l'API

Dépôt : https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR

1. Cloner le dépôt et s'y placer :

   ```bash
   git clone https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR.git
   cd OCMovies-API-EN-FR
   ```

2. Créer et activer un environnement virtuel :

   ```bash
   python3 -m venv env
   source env/bin/activate
   ```

3. Installer les dépendances, créer la base et lancer le serveur :

   ```bash
   pip install -r requirements.txt
   python manage.py create_db
   python manage.py runserver
   ```

Les étapes 1 à 3 (hors `runserver`) ne sont nécessaires qu'à l'installation.
Pour les lancements suivants, il suffit d'activer l'environnement virtuel
(`source env/bin/activate`) et de relancer `python manage.py runserver`.

L'API est alors disponible sur `http://localhost:8000/api/v1/`.

## Lancer le projet

1. Démarrer l'API (voir ci-dessus).
2. Depuis ce dossier, lancer un serveur statique, par exemple :

   ```bash
   python3 -m http.server 8080
   ```

3. Ouvrir `http://localhost:8080` dans le navigateur.

## Structure

```
index.html
css/
  base.css      variables, reset, titres, boutons
  layout.css    header, footer
  hero.css      section "Meilleur film"
  movies.css    grilles et cartes films
  modal.css     modale de détail
js/
  config.js     constantes (API, libellés de genres, couleurs)
  utils.js      fonctions utilitaires
  api.js        appels à l'API
  render.js     affichage des cartes, grilles, hero
  modal.js      logique de la modale
  main.js       point d'entrée
```
