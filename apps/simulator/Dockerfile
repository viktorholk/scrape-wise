FROM node:20-alpine AS builder

WORKDIR /builder

RUN npm install -g pnpm@9.14.2 

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY ./apps/simulator/package.json ./apps/simulator/
COPY ./packages/database/package.json ./packages/database/
COPY ./packages/database/prisma ./packages/database/prisma/

RUN pnpm install --recursive --frozen-lockfile

RUN pnpm --filter database db:generate

COPY ./apps/simulator/ ./apps/simulator/
COPY ./packages/database/src ./packages/database/src/

RUN pnpm --filter simulator run build

RUN cp -R /builder/apps/simulator/src/views /builder/apps/simulator/build/views
RUN cp -R /builder/apps/simulator/src/public /builder/apps/simulator/build/public

FROM node:20-alpine AS production

RUN npm install -g pnpm@9.14.2

WORKDIR /app

COPY --from=builder /builder/pnpm-lock.yaml ./
COPY --from=builder /builder/pnpm-workspace.yaml ./

COPY --from=builder /builder/apps/simulator/package.json ./apps/simulator/
COPY --from=builder /builder/packages/database/package.json ./packages/database/

COPY --from=builder /builder/packages/database/prisma ./packages/database/prisma/
COPY --from=builder /builder/packages/database/src ./packages/database/src/

COPY --from=builder /builder/apps/simulator/build ./apps/simulator/build/

RUN pnpm install --prod --recursive --frozen-lockfile

COPY ./apps/simulator/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["pnpm", "--filter", "simulator", "start"]
