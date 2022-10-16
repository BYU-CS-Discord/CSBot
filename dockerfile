FROM node:16-slim
RUN apt update
RUN apt upgrade

ENV DOCKER=true

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]