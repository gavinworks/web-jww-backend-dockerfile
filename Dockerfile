# syntax=docker/dockerfile:1.4
FROM directus/directus:11.4.1
USER root

# Install Node 22
RUN apk add --no-cache nodejs=22.13.1-r0 npm \
    && corepack enable \
    && corepack prepare pnpm@8.7.6 --activate \
    && chown node:node /directus

# Copy email templates
COPY --chown=node:node templates/email/viewing_request.liquid /directus/templates/email/
COPY --chown=node:node templates/email/viewing_request_customer.liquid /directus/templates/email/

# Copy extensions
COPY --chown=node:node extensions /directus/extensions

# Install extension dependencies
RUN cd /directus/extensions/hooks/algolia \
    && npm install \
    && cd /directus \
    && npm install /directus/extensions/hooks/algolia

EXPOSE 8055
USER node
CMD : \
    && node /directus/cli.js bootstrap \
    && node /directus/cli.js start;