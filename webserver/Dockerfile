FROM node:20-alpine AS frontend_builder

WORKDIR /builder

RUN npm install -g pnpm@9.14.2 

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY ./apps/frontend/package.json ./apps/frontend/

RUN pnpm install --recursive --frozen-lockfile --filter frontend

COPY ./apps/frontend/ ./apps/frontend/

RUN pnpm --filter frontend run build

FROM nginx:stable-alpine AS production

COPY --from=frontend_builder /builder/apps/frontend/dist /var/www/html

# Copy your custom Nginx configuration
# This will replace the default Nginx site configuration.
COPY ./webserver/nginx-conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
