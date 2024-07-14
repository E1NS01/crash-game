FROM node:20-alpine

WORKDIR /app

COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend/.next ./.next
COPY apps/frontend/public ./public

EXPOSE 3001

CMD [ "npm", "run", "start" ]
