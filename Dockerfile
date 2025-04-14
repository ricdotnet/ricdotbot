FROM node:22-alpine as build

WORKDIR /app

COPY ./package.json /app/package.json

RUN npm install
COPY . .

RUN npx prisma migrate deploy
RUN npx prisma generate

CMD ["npm", "run", "dev"]
