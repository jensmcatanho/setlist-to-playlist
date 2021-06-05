FROM jensmcatanho/setlist-to-playlist:base

EXPOSE 8080

WORKDIR /app

COPY package.json /app/
RUN yarn install --no-cache 

COPY . /app/

CMD [ "yarn", "start" ]
