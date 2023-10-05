FROM node:18.17.0-slim
RUN apt update
RUN apt upgrade --yes

# Necessary for /talk Dectalk (Linux x86_64)
RUN apt install libpulse0 --yes

# Necessary for /update
RUN apt install git --yes

# Necessary to install devDependencies
ENV NODE_ENV=development

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]
