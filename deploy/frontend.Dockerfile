# Сборка происходит внутри образа: новый контейнер стартует только с готовым `dist`,
# а старый продолжает отдавать сайт, пока образ собирается.

FROM node:26.11.1-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund --loglevel=error
COPY . .
# `.env` приходит секретом сборки: переменные нужны во время сборки,
# но сам файл не остаётся в слоях образа.
RUN --mount=type=secret,id=env,target=/app/.env npm run build

FROM nginx:1.29-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
