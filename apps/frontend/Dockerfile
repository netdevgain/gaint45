FROM node:20-alpine AS build

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN npm ci

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev --workspace frontend --include-workspace-root=false

COPY --from=build /app/apps/frontend ./apps/frontend
RUN rm -rf /app/apps/frontend/node_modules

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000"]
