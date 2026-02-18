FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm ci

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev --workspace backend --include-workspace-root=false
RUN rm -rf /app/apps/backend/node_modules
RUN npm install -g prisma@6.19.2

COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /app/apps/backend/scripts ./apps/backend/scripts

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
