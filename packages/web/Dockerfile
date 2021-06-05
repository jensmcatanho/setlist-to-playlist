FROM jensmcatanho/setlist-to-playlist:base

EXPOSE 3000

WORKDIR /app

COPY package.json babel.config.json webpack.config.js /app/
RUN yarn install --no-cache

COPY . /app/

CMD [ "yarn", "start" ]
