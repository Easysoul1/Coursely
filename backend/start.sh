#!/bin/sh
set -e

npx prisma migrate deploy

echo "Running database seed..."
npx tsx prisma/seed.ts

exec node dist/index.js
