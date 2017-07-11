FROM node:7.10-alpine

COPY . /app
WORKDIR /app

RUN npm install
CMD [ "npm", "start" ]
