# docker/backend.dev.Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY apps/backend/package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli prisma

COPY apps/backend ./

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["npm", "run", "dev"]