FROM node:14.0.0-alpine3.10 as build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:1.19.0-alpine as serve

COPY --from=build /app/build /usr/share/nginx/html
COPY checkEnvVars.sh /checkEnvVars.sh
RUN chmod +x /checkEnvVars.sh
EXPOSE 80
CMD /checkEnvVars.sh && nginx -g 'daemon off;'
