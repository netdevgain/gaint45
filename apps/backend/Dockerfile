FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json

# install all deps once (workspace root + backend deps)
RUN npm ci

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
RUN npm run prisma:generate
RUN npm run build


FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# keep deps available at runtime (DON'T prune & DON'T delete)
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/node_modules ./node_modules

# prisma cli for migrate deploy on boot (start-prod.mjs)
RUN npm install -g prisma@6.19.2

# app build + prisma schema + scripts
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /app/apps/backend/scripts ./apps/backend/scripts

WORKDIR /app/apps/backend

# Render uses $PORT, EXPOSE is optional but fine
EXPOSE 4000

CMD ["npm", "run", "start:prod"]
