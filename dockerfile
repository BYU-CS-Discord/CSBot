FROM node:16.10.0-slim
RUN apt update
RUN apt upgrade --yes
RUN apt-get install -y openssl

ENV DOCKER=true

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]