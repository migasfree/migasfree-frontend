# builder stage
FROM node:iron-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

# runtime stage
FROM node:iron-alpine
COPY --from=builder /app/dist/spa ./dist
RUN yarn global add http-server
EXPOSE 3000
CMD ["http-server", "dist", "--port", "3000"]
