FROM node:20-alpine

WORKDIR /app

COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend/dist ./dist
COPY apps/backend/prisma ./prisma
RUN npm install -g prisma @nestjs/cli
RUN npx prisma generate


COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["npm", "run", "start:prod"]