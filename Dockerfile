# Stage 1: Build frontend
FROM node:alpine AS frontend-build
WORKDIR /frontend
COPY ./frontend ./
RUN npm install
RUN npm run build
RUN npm prune --omit=dev

# Stage 2: Build backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /backend
COPY ./backend ./
RUN dotnet restore
RUN dotnet publish -c Release -r linux-musl-x64 -o ./publish

# Stage 3: Combined runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
RUN mkdir /config
RUN apk add --no-cache nodejs npm libc6-compat shadow su-exec bash
COPY --from=frontend-build /frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /frontend/package.json ./frontend/package.json
COPY --from=frontend-build /frontend/server.js ./frontend/server.js
COPY --from=frontend-build /frontend/build ./frontend/build
COPY --from=backend-build /backend/publish ./backend
EXPOSE 3000
ENV NODE_ENV=production
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
