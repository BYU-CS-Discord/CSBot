FROM node:16.10.0-slim
RUN apt update
RUN apt upgrade --yes

ENV DOCKER=true

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]