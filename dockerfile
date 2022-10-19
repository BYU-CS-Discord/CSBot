FROM node:slim
RUN apt update
RUN apt upgrade --yes
RUN apt install libpulse0 --yes # Necessary for Dectalk (Linux x86_64)

ENV DOCKER=true

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]