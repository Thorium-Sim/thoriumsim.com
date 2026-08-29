#!/bin/sh
litestream restore /app/app/db/data.db || true
bun run migrate migrate
litestream replicate -exec "bun run start"