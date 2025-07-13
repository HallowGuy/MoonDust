# MoonDust Définition

Ce projet a pour objectif d'être une Méta-Application, une sorte de Plateforme qui sera ensuite paramétrée pour avoir une identité pour un métier spécifique.
Un assemblage de technologie, de composants et d'outils d'une façon cohérente pour pouvoir faire des actions.

## Structure du dépôt

- **frontend/** : contiendra le code de la partie interface utilisateur. On y trouve un `Dockerfile` très commenté pour faciliter la prise en main.
- **backend/** : hébergera la logique serveur de l'application. Là encore, un `Dockerfile` explique chaque étape de la construction de l'image.
- **database/** : contient l'environnement lié à la base PostgreSQL. Le `Dockerfile` détaille les variables d'environnement utilisées pour initialiser la base.
- **keycloak/** : fournit Keycloak pour l'authentification et la gestion des utilisateurs. Un `Dockerfile` importe automatiquement le realm de démonstration `demo`.

### Schémas de base de données

Lors de l'initialisation de PostgreSQL, trois schémas sont créés automatiquement :

- `metaappfront` : tables dédiées au frontend.
- `metaappback` : tables dédiées au backend.
- `metaappsys` : tables communes et globales.

Chacun de ces dossiers pourra être complété par la suite (code, scripts, configurations). Pour l'instant ils servent uniquement de squelette afin de préparer la suite du développement.

## Lancer un exemple

Un `docker-compose.yml` minimal est fourni pour prévisualiser la page d'accueil servie par Nginx.
Depuis la racine du dépôt, exécutez :

```bash
docker compose up --build
```

La page sera alors disponible sur `http://localhost:8080` et présente un système de tuiles avec cinq tailles (`mini`, `petit`, `moyen`, `grand`, `max`).
