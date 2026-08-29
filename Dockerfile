FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock ./

COPY patches ./patches

RUN bun i

COPY app app

COPY tsconfig.json tsconfig.json
COPY vite.config.ts vite.config.ts

# Build ATProto Lexicons
RUN bun run atproto-build

RUN bun run build

FROM oven/bun:alpine AS run

WORKDIR /app

COPY --from=litestream/litestream /usr/local/bin/litestream /usr/local/bin/litestream
COPY litestream.yml /etc/litestream.yml

COPY scripts/litestream.sh .
RUN chmod +x litestream.sh

COPY public public
COPY package.json bun.lock patches ./
RUN bun i --production
COPY --from=build /app/dist dist
COPY server.ts server.ts

EXPOSE 44100

CMD ./litestream.sh

