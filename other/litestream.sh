#!/bin/sh
litestream restore /app/prisma/data.db || true
litestream replicate -exec "./start.sh"