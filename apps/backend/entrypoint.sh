#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e
# Echo commands
set -x

pnpm --filter @packages/database db:generate

pnpm --filter @packages/database db:deploy

exec "$@" 