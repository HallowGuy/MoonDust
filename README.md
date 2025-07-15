# MoonDust Définition

Ce projet a pour objectif d'être une Méta-Application, une sorte de Plateforme qui sera ensuite paramétrée pour avoir une identité pour un métier spécifique.
Un assemblage de technologie, de composants et d'outils d'une façon cohérente pour pouvoir faire des actions.

## Structure du dépôt

- **frontend/** : contiendra le code de la partie interface utilisateur. On y trouve un `Dockerfile` très commenté pour faciliter la prise en main.
- **backend/** : hébergera la logique serveur de l'application. Là encore, un `Dockerfile` explique chaque étape de la construction de l'image.
- **database/** : contient l'environnement lié à la base PostgreSQL. Le `Dockerfile` détaille les variables d'environnement utilisées pour initialiser la base.
- **keycloak/** : fournit Keycloak pour l'authentification et la gestion des utilisateurs. Un `Dockerfile` importe automatiquement le realm de démonstration `demo`.
- **elastic/** : fournit un conteneur Elasticsearch prêt à l'emploi.
- **kibana/** : offre l'interface Kibana pour explorer les données.

### Schémas de base de données

Lors de l'initialisation de PostgreSQL, plusieurs schémas sont créés automatiquement :

- `metaappfront` : tables dédiées au frontend.
- `metaappback` : tables dédiées au backend.
- `metaappsys` : tables communes et globales.
- `keycloak` : tables internes de Keycloak pour l'authentification.

Chacun de ces dossiers pourra être complété par la suite (code, scripts, configurations). Pour l'instant ils servent uniquement de squelette afin de préparer la suite du développement.

## Lancer un exemple

Un `docker-compose.yml` minimal permet maintenant de lancer le frontend, la base PostgreSQL et le backend Express servant l'API contacts.
Depuis la racine du dépôt, exécutez :

```bash
docker compose up --build
```

Les services définis dans `docker-compose.yml` disposent désormais d'un mécanisme
de contrôle d'état (*healthcheck*) et redémarrent automatiquement (`restart: unless-stopped`).
Cela évite les blocages éventuels lors du lancement.

La page sera alors disponible sur `http://localhost:8080` et présente un système de tuiles avec cinq tailles (`mini`, `petit`, `moyen`, `grand`, `max`).
Elasticsearch sera accessible sur `http://localhost:9200` et Kibana sur `http://localhost:5601`.

## API Backend

Un premier exemple d'API permet maintenant de gerer des contacts dans la base PostgreSQL. La table `metaappback.contact` stocke un nom, un numero de telephone, un email et un type numerique (0 = inconnu, 1 = entreprise, 2 = humain).

Les routes disponibles sur le backend sont :

- `GET /contacts` : liste tous les contacts
- `GET /contacts/:id` : retourne un contact
- `POST /contacts` : cree un contact
- `PUT /contacts/:id` : met a jour un contact
- `DELETE /contacts/:id` : supprime un contact

Le serveur Node.js se lance avec `npm start` dans le dossier `backend`.
