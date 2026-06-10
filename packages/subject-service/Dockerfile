FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY packages/subject-service/dist ./

ENV NODE_ENV=production

EXPOSE 3002

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "main.js"]