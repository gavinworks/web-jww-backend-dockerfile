# syntax=docker/dockerfile:1.4
FROM directus/directus:11.4.1
USER root
RUN corepack enable \
&& corepack prepare pnpm@8.7.6 --activate \
&& chown node:node /directus \
&& cd /directus \
&& npm install algoliasearch --save

# Copy email templates
COPY --chown=node:node templates/email/viewing_request.liquid /directus/templates/email/
COPY --chown=node:node templates/email/viewing_request_customer.liquid /directus/templates/email/

EXPOSE 8055
USER node
CMD : \
&& node /directus/cli.js bootstrap \
&& node /directus/cli.js start;