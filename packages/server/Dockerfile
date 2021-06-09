FROM jensmcatanho/setlist-to-playlist:base AS base

EXPOSE 8080

WORKDIR /app

COPY package.json /app/
RUN yarn install --no-cache
RUN yarn global add pm2

COPY . /app/

FROM base AS development

CMD [ "pm2-dev", "start", "index.js" ]

FROM base AS production

CMD [ "pm2-runtime", "start", "index.js" ]
