# Docker File

# Use the official image as a parent image
FROM node:22.09-alpine

# Create app directory
WORKDIR /app

COPY package.json .

# Remmove existing yarn and install the latest version
RUN rm -rf /usr/local/bin/yarn /usr/local/bin/yarnpkg && npm install -g yarn

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

EXPOSE 5433

CMD ["yarn", "start:server"]