FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json ./

RUN npm install --omit=dev --legacy-peer-deps

# Copiamos la carpeta dist específica de Programas
COPY packages/program-service/dist ./

ENV NODE_ENV=production

# Exponemos el puerto 3003
EXPOSE 3003

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "main.js"]