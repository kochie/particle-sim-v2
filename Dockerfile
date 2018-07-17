FROM node:alpine
WORKDIR /usr/src
COPY package-lock.json package.json ./
RUN npm install
COPY . .
RUN npm run build
RUN mv ./dist /public
