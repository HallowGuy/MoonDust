# Dockerfile pour la base de données
# Cette image se base sur la version officielle de PostgreSQL
# Les commentaires donnent des explications détaillées pour faciliter l'utilisation

# Image officielle PostgreSQL recommandée pour la production
FROM postgres:16

# Les variables d'environnement suivantes permettent d'initialiser la base de données
# POSTGRES_USER : nom d'utilisateur par défaut
# POSTGRES_PASSWORD : mot de passe de l'utilisateur
# POSTGRES_DB : nom de la base de données créée au démarrage
# Ici, on se contente de les déclarer pour montrer comment les utiliser
# Elles pourront être remplacées ou complétées dans un fichier docker-compose ou à
# l'exécution via la ligne de commande
ENV POSTGRES_USER=appuser \
    POSTGRES_PASSWORD=apppassword \
    POSTGRES_DB=appdb

# Optionnel : ajout d'un script d'initialisation placé dans le dossier docker-entrypoint-initdb.d
# Tout fichier .sql ou .sh présent dans ce répertoire sera exécuté au démarrage
# COPY init-db.sh /docker-entrypoint-initdb.d/

# Aucune commande CMD supplémentaire n'est nécessaire : l'image postgres
# lance automatiquement le serveur PostgreSQL

# Fin du Dockerfile database
