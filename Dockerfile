FROM node:alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --prod

FROM node:alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY .env ./
RUN npm ci --omit=dev
CMD ["node", "./dist/main"]
