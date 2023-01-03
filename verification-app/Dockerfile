FROM node:lts-alpine3.13 as verification_app_build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV REACT_APP_CERTIFICATE_STATUS_VC 'true'
ARG REACT_APP_TIMEZONE
ENV REACT_APP_TIMEZONE $REACT_APP_TIMEZONE
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
COPY . ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=verification_app_build /app/build /usr/share/nginx/html/verification-app
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 83
CMD ["nginx", "-g", "daemon off;"]