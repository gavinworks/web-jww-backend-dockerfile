# syntax=docker/dockerfile:1.4
FROM directus/directus:11.4.1
USER root
RUN corepack enable \
    && corepack prepare pnpm@8.7.6 --activate \
    && chown node:node /directus

# Copy email templates
COPY --chown=node:node templates/email/viewing_request.liquid /directus/templates/email/
COPY --chown=node:node templates/email/viewing_request_customer.liquid /directus/templates/email/

# Create extensions directory and set permissions
RUN mkdir -p /directus/extensions && chown node:node /directus/extensions

# Copy extensions (including pre-built dist folders)
COPY --chown=node:node extensions/directus-extension-algolia-reindex /directus/extensions/directus-extension-algolia-reindex
COPY --chown=node:node extensions/directus-extension-algolia /directus/extensions/directus-extension-algolia
COPY --chown=node:node extensions/directus-extension-test /directus/extensions/directus-extension-test

# Ensure correct permissions for the extensions
RUN chmod -R 755 /directus/extensions/directus-extension-algolia-reindex \
    && chmod -R 755 /directus/extensions/directus-extension-algolia \
    && chmod -R 755 /directus/extensions/directus-extension-test \
    && chown -R node:node /directus/extensions/directus-extension-algolia-reindex \
    && chown -R node:node /directus/extensions/directus-extension-algolia \
    && chown -R node:node /directus/extensions/directus-extension-test

# Install production dependencies only
RUN cd /directus/extensions/directus-extension-algolia-reindex \
    && npm ci --omit=dev \
    && cd /directus/extensions/directus-extension-algolia \
    && npm ci --omit=dev \
    && cd /directus/extensions/directus-extension-test \
    && npm ci --omit=dev

EXPOSE 8055
USER node
CMD : \
    && node /directus/cli.js bootstrap \
    && node /directus/cli.js start;