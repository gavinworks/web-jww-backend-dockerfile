# syntax=docker/dockerfile:1.4
FROM directus/directus:11.4.1
USER root
RUN corepack enable \
    && corepack prepare pnpm@8.7.6 --activate \
    && chown node:node /directus

# Copy email templates
COPY --chown=node:node templates/email/viewing_request.liquid /directus/templates/email/
COPY --chown=node:node templates/email/viewing_request_customer.liquid /directus/templates/email/

# Copy and install extension
COPY --chown=node:node extensions /directus/extensions
RUN cd /directus/extensions/hooks/directus-extension-algolia \
    && npm install \
    && npm run build

EXPOSE 8055
USER node
CMD : \
    && node /directus/cli.js bootstrap \
    && node /directus/cli.js start;