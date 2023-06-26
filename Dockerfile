FROM node:alpine as build
ARG DATABASE_URL
ENV DATABASE_URL ${DATABASE_URL}
ENV PORT 5000
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --prod

FROM node:alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
CMD ["node", "./dist/main"]
