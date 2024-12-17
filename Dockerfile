# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.7.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Astro"

# Astro app lives here
WORKDIR /app

FROM base AS deps

RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prod

FROM base AS build

RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base

WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
ENV NODE_ENV production
ENV PORT=4321
ENV HOST=0.0.0.0
EXPOSE 4321
CMD ["node", "./dist/index.js"]

# # Build application
# RUN npm run build

# # Remove development dependencies
# RUN npm prune --omit=dev






# # Start the server by default, this can be overwritten at runtime

# CMD [ "node", "./dist/server/entry.mjs" ]
