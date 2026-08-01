#!/bin/sh
litestream restore /app/app/db/data.db || true
litestream replicate -exec "bun run start"