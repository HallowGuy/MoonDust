FROM nginx:alpine

# Copy static html page
COPY index.html /usr/share/nginx/html/index.html

# Copy template configuration
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Generate configuration from environment variables and run nginx
CMD ["/bin/sh", "-c", "envsubst '$NGINX_HOST $NGINX_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
