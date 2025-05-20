FROM mcr.microsoft.com/playwright:v1.52.0-noble AS builder

RUN npm install -g pnpm@9.14.2
WORKDIR /builder

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY ./apps/backend/package.json ./apps/backend/
COPY ./packages/database/package.json ./packages/database/

COPY ./packages/database/prisma ./packages/database/prisma/

RUN pnpm install --recursive --frozen-lockfile

RUN pnpm --filter database db:generate

COPY ./packages/database/src ./packages/database/src/
COPY ./apps/backend/ ./apps/backend/

RUN pnpm --filter backend build

RUN pnpm --filter backend playwright install --with-deps chromium

FROM mcr.microsoft.com/playwright:v1.52.0-noble

ENV NODE_ENV=production

RUN npm install -g pnpm@9.14.2
WORKDIR /app

COPY --from=builder /builder/pnpm-workspace.yaml ./

COPY --from=builder /builder/apps/backend/package.json ./apps/backend/
COPY --from=builder /builder/packages/database/package.json ./packages/database/

COPY --from=builder /builder/packages/database/prisma ./packages/database/prisma/
COPY --from=builder /builder/packages/database/src ./packages/database/src/

COPY --from=builder /builder/apps/backend/build ./apps/backend/build/

COPY --from=builder /builder/pnpm-lock.yaml ./

RUN pnpm install --prod --recursive --frozen-lockfile

COPY --from=builder /ms-playwright /ms-playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY ./apps/backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3010

ENTRYPOINT ["/entrypoint.sh"]

CMD ["pnpm", "--filter", "backend", "start"] 