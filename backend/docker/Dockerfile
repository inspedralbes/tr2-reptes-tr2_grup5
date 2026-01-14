FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 1700


CMD ["npm", "run", "start:dev"]