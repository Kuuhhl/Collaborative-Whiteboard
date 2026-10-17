FROM node:20-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:1.27-alpine as serve

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/entrypoint.sh /usr/share/nginx/html
RUN chmod +x /usr/share/nginx/html/entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/usr/share/nginx/html/entrypoint.sh"]
