FROM node:20-slim
RUN apt update
RUN apt upgrade --yes

# Necessary for /update
RUN apt install git --yes

# Necessary to install devDependencies
ENV NODE_ENV=development

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]
