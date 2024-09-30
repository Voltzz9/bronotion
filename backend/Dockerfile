# Docker File

# Use the official image as a parent image
FROM node:22-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./

# Remove existing yarn and install the latest version
RUN rm -rf /usr/local/bin/yarn /usr/local/bin/yarnpkg && npm install -g yarn

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 8080

CMD ["yarn", "start:server"]