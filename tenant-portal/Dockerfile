FROM node:lts-alpine3.13 as tenant_portal_build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
ENV PUBLIC_URL /
RUN npm i --silent
COPY . ./
RUN npm run build


FROM nginx:stable-alpine
COPY --from=tenant_portal_build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 82
CMD ["nginx", "-g", "daemon off;"]
