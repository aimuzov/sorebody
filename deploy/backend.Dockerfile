# Сервис API: публичный MCP на /mcp. Node запускает TypeScript сам, сборка кода
# не нужна, но базу знаний -- knowledge.json -- собирает сайт, поэтому первая
# стадия собирает его. Контекст сборки -- корень репо: API берёт общие с сайтом
# типы из src/shared.

FROM node:26.11.1-alpine AS knowledge
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund --loglevel=error
COPY . .
RUN npm run build

FROM node:26.11.1-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
# В dependencies только то, что нужно API: Astro и линтеры живут в devDependencies.
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund --loglevel=error
COPY src/shared ./src/shared
COPY src/backend ./src/backend
COPY --from=knowledge /app/dist/knowledge.json ./dist/knowledge.json
USER node
EXPOSE 8787
CMD ["node", "src/backend/server.ts"]
