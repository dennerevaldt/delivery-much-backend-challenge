FROM node:12.16.3-alpine

RUN mkdir -p /usr/src/app/

WORKDIR /usr/src/app/

COPY . .

RUN npm install

RUN npm run build

EXPOSE ${HTTP_PORT}

CMD npm start
