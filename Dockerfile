FROM node:alpine

EXPOSE 3000 8080

#USER root
#RUN \
#  apk add build-base make gcc g++ linux-headers python-dev libc-dev libc6-compat &&\
#  yarn global add pm2

#WORKDIR /app

#RUN \
#  adduser -S nodejs &&\
#  chown -R nodejs /app &&\
#  chown -R nodejs /home/nodejs

#USER nodejs

COPY package.json yarn.lock /app/
RUN \
  yarn install --no-cache 

# Copies the rest of the application
COPY . /app/

# Runs the React build script
RUN \
  yarn run build

#USER nodejs

CMD [ "yarn", "start" ]

#CMD [ "pm2-runtime", "./src/express.js" ]