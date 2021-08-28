FROM node:16-alpine
COPY . /app
WORKDIR /app
ARG bot_token
ENV BOT_TOKEN=$bot_token
CMD yarn install && yarn start
