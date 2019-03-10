FROM node:11-alpine

ARG ENV="production"
ARG PORT=4000

EXPOSE ${PORT}

ENV NODE_ENV="${ENV}"

# Install packages and pm2 lib, as root
USER root
RUN \
  apk add build-base make gcc g++ linux-headers python-dev libc-dev libc6-compat &&\
  yarn global add pm2

WORKDIR /app

# Adds nodejs user; makes it the owner of /app
RUN \
  adduser -S nodejs &&\
  chown -R nodejs /app &&\
  chown -R nodejs /home/nodejs

USER nodejs

# Copies package.json and lockfile and install packages
COPY package.json yarn.lock /app/
RUN \
  yarn install --no-cache 

# Copies the rest of the application
COPY . /app/

# Runs the React build script
RUN \
  yarn run build

USER nodejs

CMD [ "pm2-runtime", "./src/express.js" ]
