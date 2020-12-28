FROM node:lts-alpine as vaccination_app_build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install --silent
COPY . ./
RUN npm run build