FROM node:22-alpine
WORKDIR /app
COPY worker.cjs /app/worker.cjs
USER node
ENTRYPOINT ["node", "/app/worker.cjs"]
