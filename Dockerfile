FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./certs /usr/src/app/certs

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]