FROM node:14.0.0-alpine3.10 as build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Path: Dockerfile
FROM nginx:1.19.0-alpine as serve

ARG BACKEND_BASE_URL=http://localhost:39291
ENV BACKEND_BASE_URL=$BACKEND_BASE_URL

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
