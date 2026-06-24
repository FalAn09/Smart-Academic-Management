FROM node:18-alpine

WORKDIR /app

# Excelente práctica para manejar señales de apagado en Node
RUN apk add --no-cache dumb-init

COPY package.json ./

# Usamos el mismo gestor que tus otros servicios para evitar conflictos
RUN npm install --omit=dev --legacy-peer-deps

# Copiamos la carpeta dist específica del Gateway
COPY packages/api-gateway/dist ./

ENV NODE_ENV=production

# Exponemos el puerto del Gateway
EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "main.js"]