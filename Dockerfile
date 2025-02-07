    # syntax=docker/dockerfile:1.4
FROM directus/directus:11.4.1
USER root
RUN corepack enable \
&& corepack prepare pnpm@8.7.6 --activate \
&& chown node:node /directus

# Copy email templates to the Directus templates directory
COPY --chown=node:node templates/email/viewing_request.liquid /directus/templates/email/

EXPOSE 8055
USER node
CMD : \
&& node /directus/cli.js bootstrap \
&& node /directus/cli.js start;