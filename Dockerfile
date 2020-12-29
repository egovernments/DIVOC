FROM node:lts-alpine as public_app_build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY public_app/package.json ./
COPY public_app/package-lock.json ./
RUN npm install --silent
COPY public_app ./
RUN npm run build

FROM node:lts-alpine as portal_app_build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY portal/package.json ./
COPY portal/package-lock.json ./
RUN npm install --silent
COPY portal ./
RUN npm run build

FROM node:lts-alpine as vaccination_app_build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY mobile/package.json ./
COPY mobile/package-lock.json ./
RUN npm install --silent
COPY mobile ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=public_app_build /app/build /usr/share/nginx/html
COPY --from=portal_app_build /app/build /usr/share/nginx/html/portal
COPY --from=vaccination_app_build /app/build /usr/share/nginx/html/vaccination_app
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]