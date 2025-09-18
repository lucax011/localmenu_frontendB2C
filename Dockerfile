# Dockerfile for Expo Web and E2E
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g expo-cli pnpm && pnpm install
EXPOSE 5173 8081
CMD ["pnpm", "expo", "start", "--web"]
