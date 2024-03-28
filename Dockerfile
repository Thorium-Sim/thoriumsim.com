FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY app app
COPY other other
COPY prisma prisma
COPY tsconfig.json tsconfig.json
COPY tailwind.config.js remix.config.js .

RUN npm run build

FROM node:18-alpine as runner

RUN apk add bash

COPY --from=litestream/litestream /usr/local/bin/litestream /usr/local/bin/litestream
COPY litestream.yml /etc/litestream.yml

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY --from=build /app/build build
COPY --from=build /app/public public
COPY other/start.sh .
COPY other/litestream.sh .
COPY migrate.ts .
COPY prisma/migrations prisma/migrations
COPY prisma/newschema.prisma prisma/
COPY prisma/schema.prisma prisma/
RUN npx prisma generate --schema prisma/schema.prisma
RUN npx prisma generate --schema prisma/newschema.prisma
RUN chmod +x start.sh
RUN chmod +x litestream.sh

EXPOSE 3000

CMD litestream restore /app/prisma/data.db && litestream replicate -exec "./start.sh"
CMD ./litestream.sh

