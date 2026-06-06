# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:1.25-alpine
# Copia los archivos estáticos compilados a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copia una configuración básica de Nginx para manejar rutas (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]