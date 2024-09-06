FROM node:alpine as builder

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run export-version
RUN npm run build --omit=dev

ENV DATABASE_URL="file:/db/db.sqlite"
RUN npm run db:init

FROM node:alpine as runner

WORKDIR /app

COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /db/ ./db/
COPY package*.json ./
COPY prisma prisma/
COPY scripts/launch_in_docker.sh .

RUN npm ci --omit=dev

ENV DATABASE_URL="file:/db/db.sqlite"

RUN npm run db:migrate

CMD ["sh", "/app/launch_in_docker.sh"]
