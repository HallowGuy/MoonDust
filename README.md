# MoonDust

Projet d'exemple complet avec base de données, API backend et interface web.
Ce guide s'adresse aux débutants qui souhaitent surtout travailler sur le **frontend**.

## Les trois parties du projet
- **Base de données** : PostgreSQL stocke les informations.
- **Backend** : serveur Node.js/Express qui expose les routes API.
- **Frontend** : application React utilisant Material UI.

## Comment lancer le projet
Tout fonctionne avec Docker Compose. Dans un terminal, placez-vous à la racine du projet puis exécutez :

```bash
docker-compose up --build
```

Cette commande prépare et démarre tout :
1. la base PostgreSQL ;
2. le backend Node.js ;
3. le frontend React.

Une fois l'ensemble lancé, ouvrez [http://localhost:8080](http://localhost:8080) dans votre navigateur pour voir le site.

## Organisation du frontend
Le code du frontend se trouve dans le dossier `frontend/`.

- `src/main.jsx` : point d'entrée qui lance l'application.
- `src/App.jsx` : définit les pages et la navigation.
- `src/components/` : composants réutilisables (boutons, formulaires, cartes…).
- `src/pages/` : pages de l'application (exemple : `EntityList.jsx`, `EntityCreate.jsx`).
- `src/theme.js` : couleurs et polices globales via `ThemeProvider`.

## Ajouter un composant
1. Aller dans `frontend/src/components/`.
2. Créer un fichier par exemple `MyButton.jsx`.
3. Utiliser un composant Material UI :

```jsx
import Button from '@mui/material/Button';

export default function MyButton() {
  return <Button variant="contained">Clique moi</Button>;
}
```

## Ajouter une page
1. Aller dans `frontend/src/pages/`.
2. Créer un fichier par exemple `Profile.jsx` :

```jsx
export default function Profile() {
  return <h2>Profil</h2>;
}
```

3. Ouvrir `frontend/src/App.jsx` et ajouter la route :

```jsx
import Profile from './pages/Profile.jsx';

// ...
<Route path="/profile" element={<Profile />} />
```

La navigation entre les pages utilise la librairie `react-router-dom`.

## Interaction avec le backend
Les données viennent du backend via des appels API (par exemple `/api/entity`).
On utilise `fetch` pour récupérer ou envoyer des informations :

```jsx
fetch("/api/entity")
  .then(res => res.json())
  .then(data => console.log(data));
```

## Material UI et style
Le projet utilise Material UI pour conserver un style cohérent. 
Les couleurs et polices principales sont définies dans `src/theme.js`.
Utilisez de préférence les composants MUI (`Button`, `TextField`, `DataGrid`, etc.)
plutôt que du HTML brut.

## Résumé
- Pour travailler : modifier les fichiers dans `frontend/`.
- Pour lancer le tout : `docker-compose up --build` puis aller sur [http://localhost:8080](http://localhost:8080).
- Inutile de toucher au backend ou à la base si vous débutez : concentrez-vous sur l'interface.

Bonne découverte ! 🎉
