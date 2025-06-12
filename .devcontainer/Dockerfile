# TODO: extend prod#builder

FROM node:20-slim
RUN apt update
RUN apt upgrade --yes

# Necessary to install devDependencies
ENV NODE_ENV=development

WORKDIR /cs-bot
ENTRYPOINT [ "bash" ]
