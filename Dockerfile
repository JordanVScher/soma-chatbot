FROM node:14.4.0

WORKDIR /home/node/app/

COPY package.json package-lock.json* ./

RUN npm install && npm cache clean --force

COPY . .

ARG EXPORT_PORT

EXPOSE $EXPORT_PORT

RUN npx sequelize-cli db:migrate

CMD ["npm", "run" ,"start"]