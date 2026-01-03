FROM node:20-bullseye-slim

WORKDIR /app

COPY package*.json ./
ENV PRISMA_CLIENT_ENGINE_TYPE=library \
    PRISMA_ENGINE_TYPE=library \
    PRISMA_CLI_QUERY_ENGINE_TYPE=library
RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
