# Dockerfile pour la base de données
# Cette image se base sur la version officielle de PostgreSQL
# Les commentaires donnent des explications détaillées pour faciliter l'utilisation

# Image officielle PostgreSQL recommandée pour la production
FROM postgres:16

# Les variables d'environnement (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
# seront fournies au moment du démarrage via docker-compose

# Optionnel : ajout d'un script d'initialisation placé dans le dossier docker-entrypoint-initdb.d
# Tout fichier .sql ou .sh présent dans ce répertoire sera exécuté au démarrage
COPY initdb/*.sql /docker-entrypoint-initdb.d/

# Aucune commande CMD supplémentaire n'est nécessaire : l'image postgres
# lance automatiquement le serveur PostgreSQL

# Fin du Dockerfile database
