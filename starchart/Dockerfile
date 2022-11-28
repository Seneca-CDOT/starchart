FROM node:lts-alpine3.15 AS base

# Add some metadata about who maintains this. NOTE: `MAINTAINER` is deprecated.
LABEL maintainer="Centre for Development of Open Technology, Seneca College" \
      description="Starchart domain and certificate service"

# Reduce npm log spam and colour during install within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /home/node/app
COPY package*.json /home/node/app/
RUN npm ci

###############################################################################

FROM node:lts-alpine3.15 as deploy
WORKDIR /home/node/app
COPY --chown=node:node --from=base /home/node/app/node_modules ./node_modules/
COPY --chown=node:node . ./
USER node
# Node needs to trust the pebble cert
ENV NODE_EXTRA_CA_CERTS=./test/pebble/certs/ca.cert.pem
CMD ["node", "src/index.js"]
