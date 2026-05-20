#!/bin/sh
set -e

echo "Running seed..."
node dist/db/seed.js

echo "Starting server..."
exec node dist/app.js
