FROM node:16-slim
RUN apt update
RUN apt upgrade

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]