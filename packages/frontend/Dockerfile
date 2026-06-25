FROM nginx:1.25-alpine

# Copiamos la configuración de Nginx desde la ubicación del monorepo
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# CORRECCIÓN: Copiamos UNICAMENTE el contenido de la carpeta src (tus html, js y css)
COPY packages/frontend/src/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]