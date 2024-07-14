FROM node:20-alpine

WORKDIR /app

COPY apps/backend/package*.json ./

RUN npm install

COPY apps/backend ./

COPY entrypoint.dev.sh /entrypoint.dev.sh
RUN chmod +x /entrypoint.dev.sh

EXPOSE 3000
ENTRYPOINT ["/bin/sh", "/entrypoint.dev.sh"]
CMD ["npm", "run", "dev"]