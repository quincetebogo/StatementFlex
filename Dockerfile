# Specify base target image - official node image & version.
FROM node:latest

# Set node js environment to production mode for optimizations it may apply
ENV NODE_ENV=production

# Copy service source into container
COPY . /apps/service/

# Set environment variable to configure nodejs trust store.
# Configure node process to 'trust' CapitecCA issued TLS certs and prevent likely 'self signed cert' issues.
COPY /CapitecRootCA.pem /apps/CapitecRootCA.pem
ENV NODE_EXTRA_CA_CERTS=/apps/CapitecRootCA.pem

WORKDIR /apps/service

# Set entrypoint
ENTRYPOINT ["node", "./server.js"]
