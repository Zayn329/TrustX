FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache python3
COPY worker.cjs /app/worker.cjs
COPY login_fixture.py /app/login_fixture.py
USER node
ENTRYPOINT ["node", "/app/worker.cjs"]
