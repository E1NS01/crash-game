# docker/backend.Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY apps/backend/package.json ./
RUN npm install
RUN npm install -g @nestjs/cli prisma

COPY apps/backend ./


RUN npx prisma generate



EXPOSE 3000

CMD ["npm", "run", "dev"]