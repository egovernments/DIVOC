FROM nginx:stable-alpine
COPY --from=public_app_build /app/build /usr/share/nginx/html
COPY --from=vaccination_app_build /app/build /usr/share/nginx/html/vaccination_app
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx-debug", "-g", "daemon off;"]

