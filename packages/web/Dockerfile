FROM jensmcatanho/setlist-to-playlist:base AS base

EXPOSE 3000

WORKDIR /app

COPY package.json babel.config.json webpack.config.js /app/

COPY . /app/

FROM base AS development

ENV NODE_ENV=development

RUN yarn install --no-cache
RUN yarn global add webpack webpack-cli webpack-dev-server

CMD [ "yarn", "serve" ]

FROM base AS production

ENV NODE_ENV=production

RUN yarn install --no-cache
RUN yarn global add webpack webpack-cli webpack-dev-server

CMD [ "yarn", "serve" ]