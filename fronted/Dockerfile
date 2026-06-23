FROM nginx:1.25-alpine

# Copiamos primero la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# CORRECCIÓN: Copia TODO el contenido de la carpeta frontend (incluyendo dashboard.html)
COPY . /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]