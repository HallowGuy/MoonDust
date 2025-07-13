# Mode d'emploi pour lancer MoonDust

Ce guide explique pas à pas comment mettre en route le projet **MoonDust** sur un poste de développement.

## 1. Installer Docker Desktop

1. Rendez‑vous sur [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) et téléchargez l'installeur correspondant à votre système (Windows ou macOS).
2. Lancez l'installeur et suivez les étapes par défaut.
3. Une fois l'installation terminée, démarrez Docker Desktop pour vérifier qu'il fonctionne.

## 2. Récupérer le projet

1. Ouvrez un terminal.
2. Clonez le dépôt :
   ```bash
   git clone <url-du-projet>
   ```
3. Placez‑vous dans le dossier cloné :
   ```bash
   cd MoonDust
   ```

## 3. Construire et lancer les conteneurs

Depuis la racine du projet, exécutez la commande :

```bash
docker compose up --build
```

Docker va télécharger les images nécessaires puis construire celles du projet. À la fin, les services démarrent automatiquement.

- Le frontend est disponible sur [http://localhost:8080](http://localhost:8080).
- La base de données PostgreSQL et Keycloak sont prêts mais n'ont pas encore d'interface exposée via `docker-compose` dans cette version minimale. Ils peuvent être lancés séparément à partir de leurs dossiers respectifs si nécessaire.

## 4. Paramétrage après le lancement

1. Accédez à la page d'accueil du frontend pour vérifier que tout s'affiche correctement.
2. Pour interagir avec la base de données, Keycloak, Elasticsearch ou Kibana, adaptez le fichier `docker-compose.yml` en y ajoutant les services `database`, `keycloak`, `elasticsearch` et `kibana`. Les exemples de `Dockerfile` dans chaque dossier montrent les variables d'environnement utilisables.
3. Si vous devez modifier les ports ou d'autres paramètres (mots de passe, nom de base, etc.), éditez le `docker-compose.yml` avant de relancer `docker compose up`.

## 5. Arrêter la solution

Lorsque vous avez terminé vos tests, pressez `Ctrl+C` dans le terminal qui exécute Docker, puis stoppez et supprimez les conteneurs :

```bash
docker compose down
```

Vous pouvez ensuite fermer Docker Desktop si vous le souhaitez.

