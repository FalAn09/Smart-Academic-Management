FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY packages/classroom-service/dist ./

ENV NODE_ENV=production

# Exponemos el puerto 3004
EXPOSE 3004

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "main.js"]