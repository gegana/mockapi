FROM node:7.10-alpine

COPY . /app
WORKDIR /app

RUN npm install --only=production
CMD [ "npm", "start" ]
