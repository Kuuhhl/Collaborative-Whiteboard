FROM node:latest

# Define arguments
ARG FRONTEND_BASE_URL
ARG REDIS_HOST
ARG REDIS_PORT
ARG MONGO_DB_URL
ARG MONGO_DB_NAME

# Set environment variables
ENV FRONTEND_BASE_URL=$FRONTEND_BASE_URL
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PORT=$REDIS_PORT
ENV MONGO_DB_URL=$MONGO_DB_URL
ENV MONGO_DB_NAME=$MONGO_DB_NAME

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 39291
CMD [ "npm", "start" ]