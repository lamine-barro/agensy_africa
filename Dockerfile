FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY api/package.json api/package.json
COPY web/package.json web/package.json
COPY mobile/package.json mobile/package.json
RUN npm ci
COPY api api
COPY web web
RUN npm run --workspace web build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/api api
COPY --from=build /app/web/dist web/dist
COPY --from=build /app/products products
EXPOSE 4000
CMD ["node", "api/src/server.js"]
