FROM jensmcatanho/setlist-to-playlist:base

EXPOSE 8080

WORKDIR /app

COPY package.json /app/
RUN yarn install --no-cache
RUN yarn global add pm2

COPY . /app/

CMD [ "pm2-runtime", "start", "index.js" ]
