# builder stage
FROM node:iron-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

# runtime stage
FROM node:iron-alpine
WORKDIR /app
COPY --from=builder --chown=node:node /app/dist/spa ./dist
RUN yarn global add http-server
USER node
EXPOSE 3000
CMD ["http-server", "dist", "--port", "3000"]
