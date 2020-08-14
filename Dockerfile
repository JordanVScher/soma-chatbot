FROM node:14.4.0

WORKDIR /home/node/app/

COPY package.json package-lock.json* ./

RUN npm install && npm cache clean --force

COPY . .

CMD ["npm", "run" ,"start"]