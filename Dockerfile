FROM node:7.10

COPY . /app
WORKDIR /app

RUN npm install
CMD [ "npm", "start" ]
