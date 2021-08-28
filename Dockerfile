FROM node:16-alpine
COPY . /app
WORKDIR /app
CMD yarn install && yarn start
