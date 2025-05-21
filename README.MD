# Scraper Wise

Scraper Wise is a web application for web scraping and data analysis, featuring a React frontend, an Express.js backend with Playwright, and a PostgreSQL database. It uses Docker for containerization and Nginx as a reverse proxy.

## Technology Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript, Playwright
- **Database**: PostgreSQL, Prisma (ORM)
- **Monorepo**: pnpm
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx

## Prerequisites

- Node.js (v20.x+)
- pnpm (v9.x+)
- Docker & Docker Compose

## Quick Start (Local Development)

1.  **Clone & Install Dependencies**:
    ```bash
    git clone https://github.com/viktorholk/scrape-wise.git
    cd scrape-wise
    pnpm install
    ```

2.  **Environment Variables (Local)**:
    -   **Backend (`apps/backend/`):** Copy `apps/backend/.env-example` to `apps/backend/.env`. Key variables: `DATABASE_URL`, `JWT_SECRET`. `OPENAI_API_KEY`
    -   **Database (`packages/database/`):** Copy `packages/database/.env-example` to `packages/database/.env`. Key variables: `DATABASE_URL`

4.  **Run Database Migrations and Generate types**:
    ```bash
    pnpm --filter @packages/database db:deploy
    pnpm --filter @packages/database db:generate
    ```

5.  **Run Backend**:
    ```bash
    pnpm --filter backend dev
    ```

6.  **Run Frontend**:
    ```bash
    pnpm --filter frontend dev
    ```

## Quick Start (Production with Docker)

1.  **Environment Variables (Production)**:
    - Create a `.env` file in the project root. Populate with production values for `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `OPENAI_API_KEY`

2.  **Build and Run Docker Containers**:
    ```bash
    docker-compose build
    docker-compose up -d
    ```
