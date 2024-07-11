# docker/frontend.Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY apps/frontend/package*.json ./
RUN npm install
RUN npm install -g next

COPY apps/frontend ./

EXPOSE 3001

CMD ["npm", "run", "dev"]