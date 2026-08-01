FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock ./

COPY patches ./patches

COPY --from=litestream/litestream /usr/local/bin/litestream /usr/local/bin/litestream
COPY litestream.yml /etc/litestream.yml

COPY scripts/litestream.sh .
RUN chmod +x litestream.sh

RUN bun i

COPY app app
COPY server.ts server.ts
COPY public public

COPY tsconfig.json tsconfig.json

# Build ATProto Lexicons
RUN bun run atproto-build

EXPOSE 44100

CMD ./litestream.sh

