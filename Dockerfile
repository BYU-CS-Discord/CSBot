FROM node:24-slim AS builder

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run export-version

FROM node:24-slim AS runner

ENV NODE_ENV=production

RUN apt-get install -y openssl

WORKDIR /app

COPY src ./src/
COPY --from=builder /app/src/constants/version.ts ./src/constants/
COPY res ./res/
COPY package*.json ./
COPY prisma prisma/
COPY scripts/launch_in_docker.sh ./scripts/

RUN npm ci --omit=dev

# Path internal to container; use `volumes` config to specify real system path of `/db/`
ENV DATABASE_URL="file:/db/db.sqlite"

# Using bash here to get consistent behavior and configurations
CMD ["bash", "/app/scripts/launch_in_docker.sh"]
